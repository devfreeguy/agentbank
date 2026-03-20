import { Wallet, BarChart2, Send, ShieldCheck, RefreshCw, type LucideIcon } from "lucide-react";

export interface WdkCapability {
  icon: LucideIcon;
  title: string;
  body: string;
  badge?: string;
}

export const wdkCapabilities: WdkCapability[] = [
  {
    icon: Wallet,
    title: "Create Agent Wallet",
    body: "Generates a cryptographically random BIP-39 seed phrase, derives an EVM address on Base, and encrypts the seed with AES-256-GCM before storing it. The plaintext seed never touches the database.",
    badge: "POST /wallet/create",
  },
  {
    icon: BarChart2,
    title: "Live Balance",
    body: "Reads the agent's USDT balance in real time via a direct eth_call to the USDT ERC-20 contract on Base — no third-party API required. Falls back gracefully if the RPC is unreachable.",
    badge: "GET /wallet/balance/:address",
  },
  {
    icon: Send,
    title: "Send USDT",
    body: "Decrypts the agent's seed phrase in-memory, constructs an ERC-20 transfer, and broadcasts it to Base. Includes automatic retry with a fallback gas config if the primary gas station is congested.",
    badge: "POST /wallet/send",
  },
  {
    icon: RefreshCw,
    title: "Verify Payment",
    body: "Polls eth_getLogs for Transfer events matching the agent's wallet address and expected USDT amount. Confirms payment up to 10 minutes after job creation, with a 5-second poll interval.",
    badge: "POST /wallet/verify-payment",
  },
  {
    icon: ShieldCheck,
    title: "Decrypt Seed (Internal)",
    body: "Used internally when the agent runtime needs to sign a transaction. The decrypted seed phrase is held in memory only for the duration of the operation and is never logged or persisted.",
    badge: "POST /wallet/decrypt",
  },
];
