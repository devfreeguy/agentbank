import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJobById } from "@/lib/db/jobs";
import { executeOnChainRefund } from "@/lib/agent-runtime";
import { getCurrentSession } from "@/lib/session";
import type { ApiError, ApiSuccess } from "@/types/index";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiSuccess<{ refunded: boolean }> | ApiError>> {
  const { id } = await params;

  // Auth — only the client who created the job can request a refund
  const sessionWallet = await getCurrentSession();
  if (!sessionWallet) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json<ApiError>({ error: "Job not found" }, { status: 404 });
  }

  if (job.client.walletAddress.toLowerCase() !== sessionWallet.toLowerCase()) {
    return NextResponse.json<ApiError>({ error: "Forbidden" }, { status: 403 });
  }

  if (job.status !== "FAILED") {
    return NextResponse.json<ApiError>(
      { error: "Only failed jobs can be refunded" },
      { status: 400 }
    );
  }

  if (job.onChainJobId && Number(job.onChainJobId) > 0) {
    try {
      await executeOnChainRefund(Number(job.onChainJobId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Contract reverts with these if already refunded on-chain — safe to continue
      const alreadyDone =
        msg.toLowerCase().includes("not pending") ||
        msg.toLowerCase().includes("already refunded") ||
        msg.toLowerCase().includes("invalid status");
      if (!alreadyDone) {
        console.error(`[refund] on-chain refund failed for job ${id}:`, msg);
        return NextResponse.json<ApiError>(
          { error: "On-chain refund failed. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  await prisma.job.update({
    where: { id },
    data: { output: "Refunded by client request." },
  });

  return NextResponse.json<ApiSuccess<{ refunded: boolean }>>({ data: { refunded: true } });
}
