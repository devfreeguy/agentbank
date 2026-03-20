"use client";

import { Loader2 } from "lucide-react";

interface HireStep4PollingProps {
  state: "creating" | "wallet" | "mining" | "confirming";
  shortTxHash: string;
  writeTxHash?: string;
}

const STATE_CONFIG = {
  creating: {
    label: "Creating job…",
    sub: "Setting up your task on-chain",
    color: "text-(--orange)",
  },
  wallet: {
    label: "Check your wallet",
    sub: "Approve the transaction in MetaMask or your wallet app",
    color: "text-(--orange)",
  },
  mining: {
    label: "Transaction submitted",
    sub: "Waiting for Base network confirmation",
    color: "text-(--orange)",
  },
  confirming: {
    label: "Confirming payment…",
    sub: "Almost there, finalizing your job",
    color: "text-(--green)",
  },
};

export function HireStep4Polling({ state, shortTxHash, writeTxHash }: HireStep4PollingProps) {
  const { label, sub, color } = STATE_CONFIG[state];

  return (
    <div className="flex flex-col items-center gap-4 py-7 text-center">
      {/* Spinner ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.07)]" />
        <div
          className={`absolute inset-0 rounded-full border-2 border-t-transparent ${state === "confirming" ? "border-[rgba(34,197,94,0.5)]" : "border-[rgba(232,121,58,0.5)]"} animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            size={20}
            strokeWidth={1.8}
            className={`${color} animate-spin`}
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
          />
        </div>
      </div>

      <div>
        <div className="font-head text-[15px] font-semibold mb-1">{label}</div>
        <div className="text-[12px] text-muted-foreground font-light leading-[1.6] max-w-56">
          {sub}
        </div>
      </div>

      {state === "mining" && writeTxHash && (
        <a
          href={`https://basescan.org/tx/${writeTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-(--orange) hover:opacity-75 transition-opacity bg-[rgba(232,121,58,0.08)] border border-[rgba(232,121,58,0.18)] px-2.5 py-1 rounded-full"
        >
          {shortTxHash} ↗
        </a>
      )}
    </div>
  );
}
