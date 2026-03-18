import { useEffect, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useUserStore } from "@/store/userStore";
import { useAgentStore } from "@/store/agentStore";
import { useJobStore } from "@/store/jobStore";
import { useTransactionStore } from "@/store/transactionStore";

export function useUser() {
  const { address, isConnected, status } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user, isLoading, hydrated, clearUser, syncUser, fetchUser, markOnboarded } = useUserStore();
  const clearAgents = useAgentStore((s) => s.clearAgents);
  const clearJobs = useJobStore((s) => s.clearJobs);
  const clearTransactions = useTransactionStore((s) => s.clearTransactions);

  // True once wagmi has finished reconnecting — safe to act on isConnected
  const isHydrated = status !== "connecting" && status !== "reconnecting";

  const previousAddress = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isConnected && address && !user) {
      fetchUser(address);
    }
  }, [isConnected, address, user, fetchUser]);

  useEffect(() => {
    if (!address) {
      // Wallet disconnected — clear all user-specific store data
      clearUser();
      clearAgents();
      clearJobs();
      clearTransactions();
    }
  }, [address, clearUser, clearAgents, clearJobs, clearTransactions]);

  useEffect(() => {
    const prev = previousAddress.current;
    previousAddress.current = address;

    if (prev && address && prev !== address) {
      // Account switched — clear stale data and re-authenticate
      clearUser();
      clearAgents();
      clearJobs();
      clearTransactions();
      syncUser(address, signMessageAsync);
    }
  }, [address, clearUser, clearAgents, clearJobs, clearTransactions, syncUser, signMessageAsync]);

  // Call this when the user explicitly connects their wallet for the first time
  async function signIn(walletAddress: string) {
    return syncUser(walletAddress, signMessageAsync);
  }

  return { user, isLoading, hydrated, isConnected, isHydrated, address, signIn, clearUser, markOnboarded };
}
