import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "AgentBank",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [mainnet, polygon],
  ssr: true,
});
