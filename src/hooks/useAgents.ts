import { useAgentStore } from "@/store/agentStore";

export function useAgents() {
  const {
    agents,
    myAgents,
    isLoadingAgents,
    isLoadingMyAgents,
    selectedAgent,
    agentBalances,
    fetchAgents,
    fetchMyAgents,
    fetchAgentBalance,
    addAgent,
    updateAgent,
    setSelectedAgent,
  } = useAgentStore();

  return {
    agents,
    myAgents,
    isLoadingAgents,
    isLoadingMyAgents,
    selectedAgent,
    agentBalances,
    fetchAgents,
    fetchMyAgents,
    fetchAgentBalance,
    addAgent,
    updateAgent,
    setSelectedAgent,
  };
}
