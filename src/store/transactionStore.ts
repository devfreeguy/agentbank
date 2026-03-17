import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import axiosClient from "@/lib/axiosClient";
import type { SerializedTransaction } from "@/utils/serialize";

interface TransactionState {
  transactionsByAgent: Record<string, SerializedTransaction[]>;
  isLoading: boolean;
}

interface TransactionActions {
  setTransactions: (agentId: string, transactions: SerializedTransaction[]) => void;
  fetchTransactions: (agentId: string, force?: boolean) => Promise<void>;
}

export const useTransactionStore = create<TransactionState & TransactionActions>()(
  immer((set, get) => ({
    transactionsByAgent: {},
    isLoading: false,

    setTransactions: (agentId, transactions) =>
      set((state) => {
        state.transactionsByAgent[agentId] = transactions;
      }),

    fetchTransactions: async (agentId, force = false) => {
      const { transactionsByAgent } = get();
      if (!force && transactionsByAgent[agentId] !== undefined) return;

      set((state) => {
        state.isLoading = true;
      });
      try {
        const res = await axiosClient.get<{ data: SerializedTransaction[] }>(
          `/api/agents/${agentId}/transactions`
        );
        if (res.data?.data) {
          set((state) => {
            state.transactionsByAgent[agentId] = res.data.data;
          });
        }
      } catch (err) {
        console.error("[transactionStore] fetchTransactions failed:", err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
  }))
);
