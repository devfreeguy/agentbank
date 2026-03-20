"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentPublic } from "@/types/index";
import { formatUsdt } from "@/utils/format";
import { AlertTriangle, Check, ChevronLeft, Loader2, Zap } from "lucide-react";
import { HireStep4Polling } from "./HireStep4Polling";
import { useEffect, useState } from "react";

interface HireStep3PayProps {
  agent: AgentPublic;
  taskDescription: string;
  isWalletPending: boolean;
  isMining: boolean;
  isConfirming: boolean;
  isBusy: boolean;
  isApprovingState: boolean;
  isBase: boolean;
  isSwitching: boolean;
  isQuoting?: boolean;
  writeTxHash?: string;
  payError: string | null;
  shortTxHash: string;
  onBack: () => void;
  onPay: () => void;
  onSwitchChain: () => void;
}

const THINKING_PHRASES = [
  "Waking agent engine...",
  "Analyzing task complexity...",
  "Estimating token costs...",
  "Evaluating sub-agent fees...",
  "Calculating profit margin...",
  "Finalizing quote...",
];

export function HireStep3Pay({
  agent,
  taskDescription,
  isWalletPending,
  isMining,
  isConfirming,
  isBusy,
  isApprovingState,
  isBase,
  isSwitching,
  isQuoting = false,
  writeTxHash,
  payError,
  shortTxHash,
  onBack,
  onPay,
  onSwitchChain,
}: HireStep3PayProps) {
  const [thinkingStep, setThinkingStep] = useState(0);

  useEffect(() => {
    if (!isQuoting) return;
    setThinkingStep(0);
    const interval = setInterval(() => {
      setThinkingStep((prev) =>
        prev < THINKING_PHRASES.length - 1 ? prev + 1 : prev
      );
    }, 800);
    return () => clearInterval(interval);
  }, [isQuoting]);

  const taskPreview =
    taskDescription.length > 70
      ? taskDescription.slice(0, 70) + "…"
      : taskDescription;

  const pollingState = isWalletPending
    ? "wallet"
    : isMining
    ? "mining"
    : "confirming";

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        {!isBusy && !isQuoting && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-(--hint) cursor-pointer font-body mb-5 hover:text-foreground transition-colors p-0 bg-none border-none"
          >
            <ChevronLeft size={13} strokeWidth={1.5} />
            Edit task
          </button>
        )}

        <div className="font-head text-[17px] font-semibold mb-4">Review & pay</div>

        {/* Summary card */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[12px] overflow-hidden mb-3.5">
          {[
            { label: "Agent", value: <span className="font-medium">{agent.name}</span> },
            {
              label: "Task",
              value: (
                <span className="text-[12px] text-muted-foreground max-w-52 text-right line-clamp-2 leading-[1.45]">
                  {taskPreview}
                </span>
              ),
            },
            {
              label: "Network",
              value: <Badge variant="orange">Base</Badge>,
            },
            {
              label: "Amount",
              value: (
                <span className="font-mono text-[15px] font-semibold text-(--orange)">
                  {formatUsdt(agent.pricePerTask)}
                </span>
              ),
            },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between px-4 py-2.75 text-[13px]",
                i < arr.length - 1 && "border-b border-[rgba(255,255,255,0.06)]"
              )}
            >
              <span className="text-(--hint)">{label}</span>
              {value}
            </div>
          ))}
        </div>

        {/* Polling states */}
        {isBusy && (
          <HireStep4Polling
            state={pollingState}
            shortTxHash={shortTxHash}
            writeTxHash={writeTxHash}
          />
        )}

        {/* Error */}
        {payError && !isBusy && !isQuoting && (
          <div className="bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)] rounded-[9px] px-3.5 py-3 text-[12px] text-[#ef4444] leading-[1.55] mb-3.5 flex items-start gap-2">
            <AlertTriangle size={13} className="mt-px shrink-0" />
            {payError}
          </div>
        )}

        {!isBusy && !isQuoting && !writeTxHash && (
          <div className="text-[11px] text-(--hint) text-center mt-1">
            {isBase
              ? "Sends USDT from your connected wallet on Base"
              : "You need to switch to Base to pay in USDT"}
          </div>
        )}
      </div>

      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0">
        {!isBusy && isBase && (
          <Button
            variant="primary"
            size="md"
            onClick={onPay}
            disabled={isQuoting}
            className="w-full py-3 rounded-[10px] text-[14px] font-semibold tracking-[0.01em] relative overflow-hidden"
          >
            {isQuoting ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                <span className="font-mono text-[13px]">
                  {THINKING_PHRASES[thinkingStep]}
                </span>
              </div>
            ) : (
              <>
                {isApprovingState ? (
                  <>
                    <Check size={15} strokeWidth={1.5} />
                    Approve Token Spend
                  </>
                ) : (
                  <>
                    <Zap size={14} strokeWidth={1.6} />
                    Pay {formatUsdt(agent.pricePerTask)}
                  </>
                )}
              </>
            )}
          </Button>
        )}

        {!isBusy && !isBase && (
          <Button
            variant="secondary"
            size="md"
            onClick={onSwitchChain}
            disabled={isSwitching}
            className="w-full py-3 rounded-[10px] text-[14px] font-semibold tracking-[0.01em] hover:border-(--orange) hover:text-(--orange) transition-colors"
          >
            {isSwitching ? (
              <>
                <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
                Switching network…
              </>
            ) : (
              <>
                <AlertTriangle size={15} strokeWidth={1.5} />
                Switch to Base
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );
}
