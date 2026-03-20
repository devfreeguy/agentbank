import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAgentById } from "@/lib/db/agents";
import type { ApiError, ApiSuccess } from "@/types/index";

export type AgentJobHistoryItem = {
  id: string;
  taskDescription: string;
  createdAt: Date;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiSuccess<AgentJobHistoryItem[]> | ApiError>> {
  const { id } = await params;

  try {
    const agent = await getAgentById(id);
    if (!agent) {
      return NextResponse.json<ApiError>({ error: "Agent not found" }, { status: 404 });
    }

    const jobs = await prisma.job.findMany({
      where: { agentId: id, status: "DELIVERED" },
      select: { id: true, taskDescription: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json<ApiSuccess<AgentJobHistoryItem[]>>({ data: jobs });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch job history" },
      { status: 500 }
    );
  }
}
