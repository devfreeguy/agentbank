import { useCallback, useEffect, useRef } from "react";
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

  // Keep signMessageAsync in a ref so effects don't need it as a dependency
  const signMessageRef = useRef(signMessageAsync);
  useEffect(() => {
    signMessageRef.current = signMessageAsync;
  }, [signMessageAsync]);

  // Guard against concurrent sign-in calls (prevents the 200+ popup storm)
  const isSigningRef = useRef(false);

  // Stable signIn function that won't cause useEffect re-fires
  const signIn = useCallback(async (walletAddress: string) => {
    if (isSigningRef.current) return; // already signing — bail
    isSigningRef.current = true;
    try {
      await syncUser(walletAddress, signMessageRef.current);
    } finally {
      isSigningRef.current = false;
    }
  }, [syncUser]);

  // Re-fetch existing user on page refresh (no sign required — session cookie handles auth)
  useEffect(() => {
    if (isConnected && address && !user) {
      fetchUser(address);
    }
  }, [isConnected, address, user, fetchUser]);

  // Wallet disconnected — wipe all state
  useEffect(() => {
    if (!address) {
      clearUser();
      clearAgents();
      clearJobs();
      clearTransactions();
    }
  }, [address, clearUser, clearAgents, clearJobs, clearTransactions]);

  // Account switched — clear stale state and re-authenticate
  useEffect(() => {
    const prev = previousAddress.current;
    previousAddress.current = address;

    if (prev && address && prev !== address) {
      clearUser();
      clearAgents();
      clearJobs();
      clearTransactions();
      signIn(address);
    }
  // signIn is stable (useCallback), signMessageAsync is accessed via ref
  }, [address, clearUser, clearAgents, clearJobs, clearTransactions, signIn]);

  return { user, isLoading, hydrated, isConnected, isHydrated, address, signIn, clearUser, markOnboarded };
}

