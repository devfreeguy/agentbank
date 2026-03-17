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

  let job: Awaited<ReturnType<typeof getJobById>>;
  try {
    job = await getJobById(id);
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }

  if (!job) {
    return NextResponse.json<ApiError>({ error: "Job not found" }, { status: 404 });
  }

  // Already running or done — return immediately, polling will pick up the result
  if (job.status === JobStatus.IN_PROGRESS) {
    return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
  }
  if (job.status === JobStatus.DELIVERED || job.status === JobStatus.FAILED) {
    return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
  }
  if (job.status !== JobStatus.PAID) {
    return NextResponse.json<ApiError>({ error: "Payment not confirmed" }, { status: 400 });
  }

  // Mark IN_PROGRESS immediately so the client's poll can see state change
  await prisma.job.update({
    where: { id },
    data: { status: JobStatus.IN_PROGRESS },
  });

  // Fire-and-forget — executeJob runs asynchronously, sets status to DELIVERED/FAILED when done
  executeJob(id).catch((err) => console.error("[run] executeJob failed:", err));

  return NextResponse.json<ApiSuccess<RunJobResponse>>({ data: { status: "IN_PROGRESS" } });
}
