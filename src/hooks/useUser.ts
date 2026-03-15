import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserStore } from "@/store/userStore";

export function useUser() {
  const { address, isConnected } = useAccount();
  const { user, isLoading, hydrated, clearUser, syncUser, fetchUser } = useUserStore();

  useEffect(() => {
    if (isConnected && address && !user) {
      fetchUser(address);
    }
  }, [isConnected, address, user, fetchUser]);

  return { user, isLoading, hydrated, isConnected, address, syncUser, clearUser };
}
