import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserStore } from "@/store/userStore";

export function useCurrentUser() {
  const { address, isConnected } = useAccount();
  const { syncUser } = useUserStore();

  useEffect(() => {
    if (!isConnected || !address) return;
    syncUser(address);
  }, [isConnected, address, syncUser]);

  return { address, isConnected };
}
