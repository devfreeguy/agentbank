"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowDownToLine, ExternalLink, AlertCircle, CheckCircle2, Loader2, Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useAgents } from "@/hooks/useAgents";
import { useAgentStore } from "@/store/agentStore";
import { formatUsdt, formatAddress, getExplorerTxUrl } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { AgentPublic } from "@/types/index";

type AgentWithdrawState = {
  amount: string;
  status: "idle" | "loading" | "success" | "error";
  txHash: string | null;
  error: string | null;
};

function AgentWithdrawRow({
  agent,
  balance,
  state,
  toAddress,
  onAmountChange,
  onWithdraw,
  onRefreshBalance,
}: {
  agent: AgentPublic;
  balance: string | undefined;
  state: AgentWithdrawState;
  toAddress: string;
  onAmountChange: (val: string) => void;
  onWithdraw: () => void;
  onRefreshBalance: () => void;
}) {
  const initial = agent.name.charAt(0).toUpperCase();
  const balanceNum = parseFloat(balance ?? "0");
  const amountNum = parseFloat(state.amount || "0");
  const hasBalance = balanceNum > 0;
  const amountValid = amountNum > 0 && amountNum <= balanceNum;
  const canWithdraw =
    toAddress.trim().length > 0 &&
    amountValid &&
    state.status !== "loading" &&
    state.status !== "success";

  function handleMax() {
    if (balance) onAmountChange(balanceNum.toFixed(6));
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-[12px] overflow-hidden transition-colors duration-200",
        state.status === "success"
          ? "border-[rgba(34,197,94,0.25)]"
          : state.status === "error"
          ? "border-[rgba(239,68,68,0.25)]"
          : "border-border"
      )}
    >
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
          style={{
            background: `hsl(${((agent.name.charCodeAt(0) * 37) % 360)}, 55%, 42%)`,
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">{agent.name}</p>
          <p className="text-[11px] text-(--hint) font-mono">{formatAddress(agent.walletAddress)}</p>
        </div>
        <div className="text-right shrink-0">
          {balance === undefined ? (
            <div className="flex items-center gap-1.5 text-[11px] text-(--hint)">
              <Loader2 size={11} className="animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[13px] font-semibold tabular-nums",
                  hasBalance ? "text-foreground" : "text-(--hint)"
                )}
              >
                {formatUsdt(balance)}
              </span>
              <button
                onClick={onRefreshBalance}
                className="text-(--hint) hover:text-foreground transition-colors"
                title="Refresh balance"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw form */}
      <div className="px-4 py-3">
        {state.status === "success" && state.txHash ? (
          <div className="flex items-center gap-2 py-1">
            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            <span className="text-[12.5px] text-green-500 font-medium">Withdrawn successfully</span>
            <a
              href={getExplorerTxUrl(state.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-[11px] text-(--hint) hover:text-foreground transition-colors"
            >
              View tx <ExternalLink size={10} />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Amount input */}
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={state.amount}
                onChange={(e) => onAmountChange(e.target.value)}
                disabled={state.status === "loading" || !hasBalance}
                className={cn(
                  "w-full bg-background border rounded-[8px] px-3 py-2 text-[13px] font-mono text-foreground placeholder:text-(--hint) outline-none focus:border-(--orange) transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-14",
                  state.error ? "border-red-500/50" : "border-border"
                )}
              />
              <button
                onClick={handleMax}
                disabled={!hasBalance || state.status === "loading"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-(--orange) hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-1"
              >
                MAX
              </button>
            </div>

            {/* Withdraw button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onWithdraw}
              disabled={!canWithdraw}
              className="shrink-0 h-[37px] px-4"
            >
              {state.status === "loading" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ArrowDownToLine size={13} strokeWidth={1.6} />
              )}
              {state.status === "loading" ? "Sending…" : "Withdraw"}
            </Button>
          </div>
        )}

        {state.error && state.status === "error" && (
          <div className="flex items-start gap-1.5 mt-2">
            <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-red-400 leading-[1.5]">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function WithdrawPanel() {
  const { user } = useUser();
  const { myAgents, isLoadingMyAgents, fetchMyAgents, agentBalances, fetchAgentBalance } =
    useAgents();

  const setAgentBalance = useAgentStore((s) => s.setAgentBalance);

  const [toAddress, setToAddress] = useState("");
  const [withdrawStates, setWithdrawStates] = useState<Record<string, AgentWithdrawState>>({});
  const initializedRef = useRef(false);

  // Load agents on mount
  useEffect(() => {
    if (user?.id) fetchMyAgents(user.id);
  }, [user?.id, fetchMyAgents]);

  // Load balances when agents arrive
  useEffect(() => {
    for (const agent of myAgents) {
      fetchAgentBalance(agent.id);
    }
  }, [myAgents, fetchAgentBalance]);

  // Init withdraw states
  useEffect(() => {
    if (myAgents.length === 0 || initializedRef.current) return;
    initializedRef.current = true;
    const initial: Record<string, AgentWithdrawState> = {};
    for (const agent of myAgents) {
      initial[agent.id] = { amount: "", status: "idle", txHash: null, error: null };
    }
    setWithdrawStates(initial);
  }, [myAgents]);

  function setAgentState(agentId: string, updates: Partial<AgentWithdrawState>) {
    setWithdrawStates((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates },
    }));
  }

  async function handleWithdraw(agent: AgentPublic) {
    const state = withdrawStates[agent.id];
    if (!state) return;

    setAgentState(agent.id, { status: "loading", error: null });

    try {
      const res = await fetch(`/api/agents/${agent.id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress: toAddress.trim(), amountUsdt: state.amount }),
      });
      const json = await res.json();

      if (!res.ok) {
        setAgentState(agent.id, { status: "error", error: json.error ?? "Withdrawal failed" });
      } else {
        setAgentState(agent.id, { status: "success", txHash: json.data?.txHash ?? null });
        // Clear cached balance so next fetch is fresh
        setTimeout(() => {
          setAgentBalance(agent.id, "0");
        }, 1500);
      }
    } catch {
      setAgentState(agent.id, {
        status: "error",
        error: "Network error. Please check your connection and try again.",
      });
    }
  }

  async function handleRefreshBalance(agentId: string) {
    // Reset to force re-fetch: set to undefined by temporarily clearing, then fetch
    try {
      const res = await fetch(`/api/agents/${agentId}/balance`);
      const json = await res.json();
      if (json.data?.balance !== undefined) {
        setAgentBalance(agentId, json.data.balance);
      }
    } catch {
      // silent
    }
  }

  const totalBalance = myAgents.reduce((sum, a) => {
    const b = agentBalances[a.id];
    return sum + (b !== undefined ? parseFloat(b) : 0);
  }, 0);

  const hasAgents = myAgents.length > 0;

  return (
    <div className="px-6.5 py-7 max-[560px]:px-3.5 max-[560px]:py-4 max-w-[680px] mx-auto w-full flex flex-col gap-5">
      {/* Summary card */}
      <div className="bg-card border border-border rounded-[12px] px-5 py-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-[9px] bg-[rgba(232,121,58,0.1)] flex items-center justify-center shrink-0">
          <ArrowDownToLine size={16} className="text-(--orange)" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-(--hint) font-medium uppercase tracking-wide mb-0.5">
            Total withdrawable
          </p>
          <p className="text-[20px] font-bold text-foreground font-head leading-none tabular-nums">
            {formatUsdt(totalBalance.toFixed(2))}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-(--hint)">{myAgents.length} agent{myAgents.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Destination address */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-(--hint) uppercase tracking-wide">
          Destination wallet address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="w-full bg-card border border-border rounded-[10px] px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-(--hint) outline-none focus:border-(--orange) transition-colors"
        />
        <p className="text-[11.5px] text-(--hint) leading-[1.55]">
          USDT will be sent to this address on Base. Double-check before withdrawing — blockchain transactions are irreversible.
        </p>
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-medium text-(--hint) uppercase tracking-wide">Your agents</p>

        {isLoadingMyAgents && !hasAgents && (
          <div className="flex items-center gap-2 py-6 justify-center text-(--hint)">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-[13px]">Loading agents…</span>
          </div>
        )}

        {!isLoadingMyAgents && !hasAgents && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Bot size={28} className="text-(--hint)" strokeWidth={1.4} />
            <p className="text-[13px] text-(--hint)">You haven&apos;t deployed any agents yet.</p>
          </div>
        )}

        {myAgents.map((agent) => {
          const state = withdrawStates[agent.id] ?? {
            amount: "",
            status: "idle" as const,
            txHash: null,
            error: null,
          };
          return (
            <AgentWithdrawRow
              key={agent.id}
              agent={agent}
              balance={agentBalances[agent.id]}
              state={state}
              toAddress={toAddress}
              onAmountChange={(val) => setAgentState(agent.id, { amount: val, error: null })}
              onWithdraw={() => handleWithdraw(agent)}
              onRefreshBalance={() => handleRefreshBalance(agent.id)}
            />
          );
        })}
      </div>

      {/* Warning note */}
      {hasAgents && (
        <div className="bg-[rgba(232,121,58,0.05)] border border-(--orange-border) rounded-[10px] px-4 py-3 text-[12px] text-(--hint) leading-[1.65]">
          <strong className="text-foreground font-medium">Important:</strong> Funds withdrawn from an agent wallet will no longer be available to cover gas fees or API costs for that agent. Ensure the agent retains sufficient balance to operate.
        </div>
      )}
    </div>
  );
}
