"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentPublic } from "@/types/index";
import { formatUsdt } from "@/utils/format";
import { AlertTriangle, Check, ChevronLeft, Loader2 } from "lucide-react";
import { HireStep4Polling } from "./HireStep4Polling";

interface HireStep3PayProps {
  agent: AgentPublic;
  taskDescription: string;
  isWalletPending: boolean;
  isMining: boolean;
  isConfirming: boolean;
  isBusy: boolean;
  isApprovingState: boolean;
  isOnPolygon: boolean;
  isSwitching: boolean;
  writeTxHash?: string;
  payError: string | null;
  shortTxHash: string;
  onBack: () => void;
  onPay: () => void;
  onSwitchChain: () => void;
}

export function HireStep3Pay({
  agent,
  taskDescription,
  isWalletPending,
  isMining,
  isConfirming,
  isBusy,
  isApprovingState,
  isOnPolygon,
  isSwitching,
  writeTxHash,
  payError,
  shortTxHash,
  onBack,
  onPay,
  onSwitchChain,
}: HireStep3PayProps) {
  const taskPreview =
    taskDescription.length > 60
      ? taskDescription.slice(0, 60) + "…"
      : taskDescription;

  const pollingState = isWalletPending ? "wallet" : isMining ? "mining" : "confirming";

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5.5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        {!isBusy && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 bg-none border-none text-[12px] text-muted-foreground cursor-pointer font-body mb-4 hover:text-foreground transition-colors p-0"
          >
            <ChevronLeft size={13} strokeWidth={1.4} />
            Edit task
          </button>
        )}

        <div className="font-head text-[16px] font-bold mb-3.5">Review & pay</div>

        {/* Summary card */}
        <div className="bg-card border border-border rounded-[11px] p-3.5 px-4 mb-3.5">
          {[
            { label: "Agent", value: <span className="font-medium">{agent.name}</span> },
            {
              label: "Task",
              value: (
                <span className="text-[12px] text-muted-foreground max-w-60 text-right">
                  {taskPreview}
                </span>
              ),
            },
            {
              label: "Network",
              value: <Badge variant="orange">Polygon</Badge>,
            },
            {
              label: "Amount",
              value: (
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-(--green) font-medium">
                    {formatUsdt(agent.pricePerTask)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    + 0.1 MATIC (Gas Reserve)
                  </span>
                </div>
              ),
            },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between py-1.75 text-[13px]",
                i < arr.length - 1 && "border-b border-border"
              )}
            >
              <span className="text-muted-foreground">{label}</span>
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
        {payError && !isBusy && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-[9px] px-3.25 py-2.75 text-[12px] text-destructive leading-[1.55] mb-3.5">
            <AlertTriangle size={13} className="inline mr-1.5 mb-0.5" />
            {payError}
          </div>
        )}

        {/* Hint */}
        {!isBusy && !writeTxHash && isOnPolygon && (
          <div className="text-[11px] text-(--hint) text-center mt-1">
            Sends USDT from your connected wallet on Polygon
          </div>
        )}
        {!isBusy && !isOnPolygon && (
          <div className="text-[11px] text-(--hint) text-center mt-1">
            You need to be on Polygon to pay in USDT
          </div>
        )}
      </div>

      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0">
        {!isBusy && isOnPolygon && (
          <Button
            variant="primary"
            size="md"
            onClick={onPay}
            className="w-full py-3.25 rounded-[10px] text-[14px] font-semibold tracking-[0.01em]"
          >
            <Check size={15} strokeWidth={1.5} />
            {isApprovingState ? "Approve Token Spend" : `Pay ${formatUsdt(agent.pricePerTask)}`}
          </Button>
        )}

        {!isBusy && !isOnPolygon && (
          <Button
            variant="secondary"
            size="md"
            onClick={onSwitchChain}
            disabled={isSwitching}
            className="w-full py-3.25 rounded-[10px] text-[14px] font-semibold tracking-[0.01em] hover:border-(--orange) hover:text-(--orange) transition-colors"
          >
            {isSwitching ? (
              <>
                <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
                Switching network…
              </>
            ) : (
              <>
                <AlertTriangle size={15} strokeWidth={1.5} />
                Switch to Polygon
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );
}
