import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";

export function useCurrentUser() {
  const { address, isConnected, signIn } = useUser();

  useEffect(() => {
    if (!isConnected || !address) return;
    signIn(address).catch(() => {});
  }, [isConnected, address, signIn]);

  return { address, isConnected };
}
