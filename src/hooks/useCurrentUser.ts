import { useAccount } from "wagmi";

/**
 * Thin read-only hook for components that only need the current wallet address.
 * Sign-in (SIWE) is handled exclusively by the connect page — do NOT call signIn here.
 */
export function useCurrentUser() {
  const { address, isConnected } = useAccount();
  return { address, isConnected };
}
