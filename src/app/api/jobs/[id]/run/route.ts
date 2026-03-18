import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/db/jobs";
import { executeJob } from "@/lib/agent-runtime";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@/generated/prisma/enums";
import type { ApiError, ApiSuccess } from "@/types/index";

type RunJobResponse = {
  status: "IN_PROGRESS";
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiSuccess<RunJobResponse> | ApiError>> {
  const { id } = await params;
  console.log("[run] received request for job:", id);

  let job: Awaited<ReturnType<typeof getJobById>>;
  try {
    job = await getJobById(id);
  } catch (error) {
    console.error("[run] error fetching job:", error);
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }

  if (!job) {
    return NextResponse.json<ApiError>({ error: "Job not found" }, { status: 404 });
  }

  // Already running — return immediately, polling will pick up the result
  if (job.status === JobStatus.IN_PROGRESS) {
    console.log("[run] job already IN_PROGRESS, returning early");
    return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
  }
  // Already done — nothing to do
  if (job.status === JobStatus.DELIVERED) {
    console.log("[run] job already DELIVERED, returning early");
    return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
  }
  // Retry: reset FAILED → PAID so the runtime's status check passes
  if (job.status === JobStatus.FAILED) {
    console.log("[run] resetting job status FAILED → PAID...");
    await prisma.job.update({ where: { id }, data: { status: JobStatus.PAID } });
    console.log("[run] job status reset success");
  } else if (job.status !== JobStatus.PAID) {
    return NextResponse.json<ApiError>({ error: "Payment not confirmed" }, { status: 400 });
  }

  // Mark IN_PROGRESS immediately so the client's poll can see state change
  await prisma.job.update({
    where: { id },
    data: { status: JobStatus.IN_PROGRESS },
  });

  // Fire-and-forget — executeJob runs asynchronously, sets status to DELIVERED/FAILED when done
  console.log("[run] firing executeJob async...");
  executeJob(id).catch((err) => console.error("[run] executeJob error:", err));

  console.log("[run] returning 200 IN_PROGRESS");
  return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
}
