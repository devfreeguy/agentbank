import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@tetherto/wdk",
    "@tetherto/wdk-wallet-evm",
    "@tetherto/wdk-secret-manager",
    "sodium-native",
  ],
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
