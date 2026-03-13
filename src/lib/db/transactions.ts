import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/enums";

const transactionSelect = {
  id: true,
  agentId: true,
  type: true,
  amountUsdt: true,
  txHash: true,
  description: true,
  createdAt: true,
} as const;

export async function createTransaction(data: {
  agentId: string;
  type: TransactionType;
  amountUsdt: string;
  txHash?: string;
  description: string;
}) {
  try {
    return await prisma.agentTransaction.create({
      data,
      select: transactionSelect,
    });
  } catch (error) {
    throw new Error(
      `createTransaction failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getTransactionsByAgent(agentId: string, limit = 50) {
  try {
    return await prisma.agentTransaction.findMany({
      where: { agentId },
      select: transactionSelect,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    throw new Error(
      `getTransactionsByAgent failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
