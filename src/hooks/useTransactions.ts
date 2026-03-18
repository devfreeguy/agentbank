import { useTransactionStore } from "@/store/transactionStore";

export function useTransactions() {
  const { allTransactions, isLoading, fetchAllTransactions, clearTransactions } = useTransactionStore();

  return { allTransactions, isLoading, fetchAllTransactions, clearTransactions };
}
