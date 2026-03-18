import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import axiosClient from "@/lib/axiosClient";
import type { SerializedTransaction } from "@/utils/serialize";

interface TransactionState {
  allTransactions: SerializedTransaction[];
  isLoading: boolean;
}

interface TransactionActions {
  setAllTransactions: (transactions: SerializedTransaction[]) => void;
  fetchAllTransactions: (force?: boolean) => Promise<void>;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState & TransactionActions>()(
  immer((set, get) => ({
    allTransactions: [],
    isLoading: false,

    setAllTransactions: (transactions) =>
      set((state) => {
        state.allTransactions = transactions;
      }),

    fetchAllTransactions: async (force = false) => {
      const { allTransactions } = get();
      if (!force && allTransactions.length > 0) return;

      set((state) => {
        state.isLoading = true;
      });
      try {
        const res = await axiosClient.get<{ data: SerializedTransaction[] }>(
          `/api/transactions`
        );
        if (res.data?.data) {
          set((state) => {
            state.allTransactions = res.data.data;
          });
        }
      } catch (err) {
        console.error("[transactionStore] fetchAllTransactions failed:", err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    clearTransactions: () =>
      set((state) => {
        state.allTransactions = [];
      }),
  }))
);
