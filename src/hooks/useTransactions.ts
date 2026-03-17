import { useTransactionStore } from "@/store/transactionStore";

export function useTransactions() {
  const { transactionsByAgent, isLoading, fetchTransactions, clearTransactions } = useTransactionStore();

  return { transactionsByAgent, isLoading, fetchTransactions, clearTransactions };
}
