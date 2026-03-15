import { useTransactionStore } from "@/store/transactionStore";

export function useTransactions() {
  const { transactionsByAgent, isLoading, fetchTransactions } = useTransactionStore();

  return { transactionsByAgent, isLoading, fetchTransactions };
}
