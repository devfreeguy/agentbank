import { AgentStatus, JobStatus, Role } from "@/generated/prisma/enums";

export type AgentPublic = {
  id: string;
  ownerId: string;
  name: string;
  systemPrompt: string;
  pricePerTask: string;
  categories: string[];
  walletAddress: string;
  status: AgentStatus;
  totalEarned: string;
  totalSpent: string;
  rating: number;
  jobsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
};

export type JobWithRelations = {
  id: string;
  clientId: string;
  agentId: string;
  taskDescription: string;
  priceUsdt: string;
  status: JobStatus;
  output: string | null;
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  agent: AgentPublic;
  client: {
    id: string;
    walletAddress: string;
  };
};

export type ApiError = {
  error: string;
  code?: string;
};

export type ApiSuccess<T> = {
  data: T;
};

export type WalletUser = {
  id: string;
  walletAddress: string;
  role: Role;
};
