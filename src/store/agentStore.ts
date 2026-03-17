import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import axiosClient from "@/lib/axiosClient";
import type { AgentPublic } from "@/types/index";

interface AgentState {
  agents: AgentPublic[];
  myAgents: AgentPublic[];
  myAgentsOwnerId: string | null;
  selectedAgent: AgentPublic | null;
  agentBalances: Record<string, string>;
  isLoadingAgents: boolean;
  isLoadingMyAgents: boolean;
  lastFetchedAt: number | null;
}

interface AgentActions {
  setAgents: (agents: AgentPublic[]) => void;
  setMyAgents: (agents: AgentPublic[]) => void;
  setSelectedAgent: (agent: AgentPublic | null) => void;
  addAgent: (agent: AgentPublic) => void;
  updateAgent: (id: string, updates: Partial<AgentPublic>) => void;
  setAgentBalance: (agentId: string, balance: string) => void;
  fetchAgents: (force?: boolean) => Promise<void>;
  fetchMyAgents: (ownerId: string, force?: boolean) => Promise<void>;
  fetchAgentBalance: (agentId: string) => Promise<void>;
  clearAgents: () => void;
}

export const useAgentStore = create<AgentState & AgentActions>()(
  immer((set, get) => ({
    agents: [],
    myAgents: [],
    myAgentsOwnerId: null,
    selectedAgent: null,
    agentBalances: {},
    isLoadingAgents: false,
    isLoadingMyAgents: false,
    lastFetchedAt: null,

    setAgents: (agents) =>
      set((state) => {
        state.agents = agents;
      }),

    setMyAgents: (agents) =>
      set((state) => {
        state.myAgents = agents;
      }),

    setSelectedAgent: (agent) =>
      set((state) => {
        state.selectedAgent = agent;
      }),

    addAgent: (agent) =>
      set((state) => {
        state.agents.push(agent);
        state.myAgents.push(agent);
      }),

    updateAgent: (id, updates) =>
      set((state) => {
        const updateIn = (list: AgentPublic[]) => {
          const idx = list.findIndex((a) => a.id === id);
          if (idx !== -1) Object.assign(list[idx], updates);
        };
        updateIn(state.agents);
        updateIn(state.myAgents);
      }),

    setAgentBalance: (agentId, balance) =>
      set((state) => {
        state.agentBalances[agentId] = balance;
      }),

    fetchAgents: async (force = false) => {
      const { lastFetchedAt } = get();
      if (!force && lastFetchedAt !== null && Date.now() - lastFetchedAt < 60000) return;

      set((state) => {
        state.isLoadingAgents = true;
      });
      try {
        const res = await axiosClient.get<{ data: AgentPublic[] }>("/api/agents");
        if (res.data?.data) {
          set((state) => {
            state.agents = res.data.data;
            state.lastFetchedAt = Date.now();
          });
        }
      } catch (err) {
        console.error("[agentStore] fetchAgents failed:", err);
      } finally {
        set((state) => {
          state.isLoadingAgents = false;
        });
      }
    },

    fetchMyAgents: async (ownerId, force = false) => {
      const { myAgentsOwnerId, myAgents } = get();
      if (!force && myAgentsOwnerId === ownerId && myAgents.length > 0) return;

      set((state) => {
        state.isLoadingMyAgents = true;
      });
      try {
        const res = await axiosClient.get<{ data: AgentPublic[] }>(
          `/api/agents?ownerId=${ownerId}`
        );
        if (res.data?.data) {
          set((state) => {
            state.myAgents = res.data.data;
            state.myAgentsOwnerId = ownerId;
          });
        }
      } catch (err) {
        console.error("[agentStore] fetchMyAgents failed:", err);
      } finally {
        set((state) => {
          state.isLoadingMyAgents = false;
        });
      }
    },

    fetchAgentBalance: async (agentId) => {
      const { agentBalances } = get();
      if (agentBalances[agentId] !== undefined) return;

      try {
        const res = await axiosClient.get<{ data: { balance: string; walletAddress: string } }>(
          `/api/agents/${agentId}/balance`
        );
        if (res.data?.data) {
          set((state) => {
            state.agentBalances[agentId] = res.data.data.balance;
          });
        }
      } catch (err) {
        console.error("[agentStore] fetchAgentBalance failed:", err);
      }
    },

    clearAgents: () =>
      set((state) => {
        state.agents = [];
        state.myAgents = [];
        state.myAgentsOwnerId = null;
        state.agentBalances = {};
        state.lastFetchedAt = null;
        state.selectedAgent = null;
      }),
  }))
);
