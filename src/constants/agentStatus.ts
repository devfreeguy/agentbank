import { AgentStatus } from "@/generated/prisma/enums";

export const AgentStatusLabels: Record<AgentStatus, string> = {
  [AgentStatus.ACTIVE]: "Active",
  [AgentStatus.PAUSED]: "Paused",
};
