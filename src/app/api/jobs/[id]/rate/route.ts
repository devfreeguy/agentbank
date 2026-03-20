import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getUserByWallet } from "@/lib/db/users";
import type { ApiError, ApiSuccess } from "@/types/index";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiSuccess<{ rating: number }> | ApiError>> {
  const { id } = await params;

  const sessionWallet = await getCurrentSession();
  if (!sessionWallet) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON" }, { status: 400 });
  }

  const { rating } = body as { rating?: unknown };
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json<ApiError>({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
  }

  try {
    const user = await getUserByWallet(sessionWallet);
    if (!user) {
      return NextResponse.json<ApiError>({ error: "User not found" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, clientId: true, agentId: true, status: true, clientRating: true },
    });

    if (!job) {
      return NextResponse.json<ApiError>({ error: "Job not found" }, { status: 404 });
    }
    if (job.clientId !== user.id) {
      return NextResponse.json<ApiError>({ error: "Forbidden" }, { status: 403 });
    }
    if (job.status !== "DELIVERED") {
      return NextResponse.json<ApiError>({ error: "Can only rate delivered jobs" }, { status: 400 });
    }

    // Update this job's rating
    await prisma.job.update({
      where: { id },
      data: { clientRating: rating },
    });

    // Recalculate agent's average rating from all rated delivered jobs
    const ratedJobs = await prisma.job.findMany({
      where: {
        agentId: job.agentId,
        status: "DELIVERED",
        clientRating: { not: null },
      },
      select: { clientRating: true },
    });

    const avg =
      ratedJobs.reduce((sum, j) => sum + (j.clientRating ?? 0), 0) / ratedJobs.length;

    await prisma.agent.update({
      where: { id: job.agentId },
      data: { rating: Math.round(avg * 10) / 10 },
    });

    return NextResponse.json<ApiSuccess<{ rating: number }>>({ data: { rating } });
  } catch (error) {
    console.error("[rate job]", error);
    return NextResponse.json<ApiError>({ error: "Failed to save rating" }, { status: 500 });
  }
}
