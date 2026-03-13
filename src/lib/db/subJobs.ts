import { prisma } from "@/lib/prisma";
import { SubJobStatus } from "@/generated/prisma/enums";

const subJobSelect = {
  id: true,
  parentJobId: true,
  parentAgentId: true,
  subAgentId: true,
  taskDescription: true,
  priceUsdt: true,
  status: true,
  output: true,
  txHash: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createSubJob(data: {
  parentJobId: string;
  parentAgentId: string;
  subAgentId: string;
  taskDescription: string;
  priceUsdt: string;
}) {
  try {
    return await prisma.subAgentJob.create({
      data,
      select: subJobSelect,
    });
  } catch (error) {
    throw new Error(
      `createSubJob failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getSubJobsByParentJob(parentJobId: string) {
  try {
    return await prisma.subAgentJob.findMany({
      where: { parentJobId },
      select: subJobSelect,
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    throw new Error(
      `getSubJobsByParentJob failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateSubJobStatus(id: string, status: SubJobStatus) {
  try {
    return await prisma.subAgentJob.update({
      where: { id },
      data: { status },
      select: subJobSelect,
    });
  } catch (error) {
    throw new Error(
      `updateSubJobStatus failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateSubJobOutput(id: string, output: string, txHash?: string) {
  try {
    return await prisma.subAgentJob.update({
      where: { id },
      data: {
        output,
        ...(txHash ? { txHash } : {}),
      },
      select: subJobSelect,
    });
  } catch (error) {
    throw new Error(
      `updateSubJobOutput failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
