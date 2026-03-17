import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/db/jobs";
import { pollForPayment } from "@/lib/indexer";
import { prisma } from "@/lib/prisma";
import { JobStatus, TransactionType } from "@/generated/prisma/enums";
import type { ApiError, ApiSuccess } from "@/types/index";

type CheckPaymentResponse = {
  confirmed: boolean;
  status: JobStatus;
  txHash?: string;
};

const ALREADY_PAID_STATUSES = new Set<JobStatus>([
  JobStatus.PAID,
  JobStatus.IN_PROGRESS,
  JobStatus.DELIVERED,
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiSuccess<CheckPaymentResponse> | ApiError>> {
  const { id } = await params;

  // Optional txHash from wagmi-confirmed transaction
  let bodyTxHash: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.txHash === "string" && body.txHash.length > 0) {
      bodyTxHash = body.txHash;
    }
  } catch {
    // no body — fine
  }

  try {
    const job = await getJobById(id);
    if (!job) {
      return NextResponse.json<ApiError>({ error: "Job not found" }, { status: 404 });
    }

    if (ALREADY_PAID_STATUSES.has(job.status) || job.status === JobStatus.FAILED) {
      return NextResponse.json<ApiSuccess<CheckPaymentResponse>>({
        data: {
          confirmed: job.status !== JobStatus.PENDING_PAYMENT,
          status: job.status,
          ...(job.txHash ? { txHash: job.txHash } : {}),
        },
      });
    }

    // If wagmi-confirmed txHash provided, trust on-chain confirmation and mark paid immediately
    if (bodyTxHash) {
      const priceUsdt = job.priceUsdt.toString();
      await prisma.$transaction([
        prisma.job.update({
          where: { id },
          data: { status: JobStatus.PAID, txHash: bodyTxHash },
        }),
        prisma.agentTransaction.create({
          data: {
            agentId: job.agentId,
            type: TransactionType.EARNED,
            amountUsdt: priceUsdt,
            txHash: bodyTxHash,
            description: `Payment received for job ${id}`,
          },
        }),
        prisma.agent.update({
          where: { id: job.agentId },
          data: { totalEarned: { increment: priceUsdt } },
        }),
      ]);

      return NextResponse.json<ApiSuccess<CheckPaymentResponse>>({
        data: { confirmed: true, status: JobStatus.PAID, txHash: bodyTxHash },
      });
    }

    // status is PENDING_PAYMENT — poll for incoming transfer
    const afterTimestamp = Math.floor(job.createdAt.getTime() / 1000);
    const priceUsdt = job.priceUsdt.toString();
    const result = await pollForPayment(job.agent.walletAddress, priceUsdt, afterTimestamp);

    if (!result) {
      return NextResponse.json<ApiSuccess<CheckPaymentResponse>>({
        data: { confirmed: false, status: JobStatus.PENDING_PAYMENT },
      });
    }

    const { txHash } = result;

    await prisma.$transaction([
      prisma.job.update({
        where: { id },
        data: { status: JobStatus.PAID, txHash },
      }),
      prisma.agentTransaction.create({
        data: {
          agentId: job.agentId,
          type: TransactionType.EARNED,
          amountUsdt: priceUsdt,
          txHash,
          description: `Payment received for job ${id}`,
        },
      }),
      prisma.agent.update({
        where: { id: job.agentId },
        data: { totalEarned: { increment: priceUsdt } },
      }),
    ]);

    return NextResponse.json<ApiSuccess<CheckPaymentResponse>>({
      data: { confirmed: true, status: JobStatus.PAID, txHash },
    });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
