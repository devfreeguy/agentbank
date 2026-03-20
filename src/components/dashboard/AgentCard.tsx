"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import axiosClient from "@/lib/axiosClient";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store/agentStore";
import { useCategoryStore } from "@/store/categoryStore";
import type { AgentPublic } from "@/types/index";
import { formatAddress } from "@/utils/format";
import { getAvatarColor } from "@/utils/avatarColor";
import { ArrowUpRight, Loader2, Pause, Play, TrendingUp, Wallet, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AgentCardProps {
  agent: AgentPublic;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { agentBalances, fetchAgentBalance, updateAgent } = useAgentStore();
  const { categories } = useCategoryStore();
  const balance = agentBalances[agent.id];
  const isActive = agent.status === "ACTIVE";
  const avatarBg = getAvatarColor(agent.id);
  const initial = agent.name.charAt(0).toUpperCase();

  const [togglingStatus, setTogglingStatus] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawTo, setWithdrawTo] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    fetchAgentBalance(agent.id);
  }, [agent.id, fetchAgentBalance]);

  async function handleToggle(checked: boolean) {
    setTogglingStatus(true);
    try {
      const newStatus = checked ? "ACTIVE" : "PAUSED";
      await axiosClient.patch(`/api/agents/${agent.id}`, { status: newStatus });
      updateAgent(agent.id, { status: newStatus });
    } catch (err) {
      console.error("toggle status failed:", err);
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleWithdraw() {
    setWithdrawing(true);
    setWithdrawError("");
    try {
      const res = await axiosClient.post(
        `/api/agents/${agent.id}/withdraw`,
        { toAddress: withdrawTo, amountUsdt: withdrawAmt }
      );

      if (res.status >= 400) {
        const msg = (res.data as any)?.error ?? "Withdrawal failed";
        setWithdrawError(msg);
        return;
      }

      const txHash = (res.data as any)?.data?.txHash as string;
      const short = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

      toast.success("Withdrawal successful", {
        description: (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100"
          >
            {short}
          </a>
        ),
      });

      setWithdrawOpen(false);
      setWithdrawTo("");
      setWithdrawAmt("");
      fetchAgentBalance(agent.id);
    } catch (err) {
      setWithdrawError("Withdrawal failed. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  }

  const agentCategories = agent.categoryIds
    .slice(0, 2)
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <>
      <div
        className={cn(
          "relative bg-sidebar rounded-[16px] overflow-hidden border transition-all duration-200",
          isActive
            ? "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.18)]"
            : "border-[rgba(255,255,255,0.06)] opacity-80 hover:border-[rgba(255,255,255,0.1)]"
        )}
      >
        {/* Status glow strip */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300",
            isActive ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.7), transparent)",
          }}
        />

        {/* Header */}
        <div className="px-4 pt-4 pb-3.5">
          <div className="flex items-start justify-between gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0 text-[16px] font-bold font-head text-white"
                style={{ background: avatarBg }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.75 mb-0.5">
                  <span className="font-head text-[14px] font-semibold truncate">
                    {agent.name}
                  </span>
                </div>
                {agentCategories.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {agentCategories.map((name) => (
                      <span
                        key={name}
                        className="text-[10px] px-1.75 py-[2px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-(--hint) leading-none"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={togglingStatus}
              />
              <span
                className={cn(
                  "text-[10px] font-medium tracking-[.04em]",
                  isActive ? "text-(--green)" : "text-(--hint)"
                )}
              >
                {isActive ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Balance section */}
        <div className="mx-4 mb-3 rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3.5 py-3">
          <div className="flex items-end justify-between mb-0.5">
            <div className="text-[10px] text-(--hint) uppercase tracking-[.07em] flex items-center gap-1">
              <Wallet size={9} strokeWidth={1.6} />
              Balance
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="text-[rgba(251,191,36,0.9)]">★</span>
              <span>{agent.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            {balance === undefined ? (
              <Skeleton className="h-7 w-24 mt-0.5" />
            ) : (
              <>
                <span
                  className={cn(
                    "font-mono text-[26px] font-semibold leading-none",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {parseFloat(balance).toFixed(2)}
                </span>
                <span className="font-mono text-[12px] text-muted-foreground pb-0.5">USDT</span>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 mx-4 mb-3 rounded-[12px] overflow-hidden border border-[rgba(255,255,255,0.06)] divide-x divide-[rgba(255,255,255,0.06)]">
          <div className="px-3 py-2.5 bg-[rgba(34,197,94,0.04)]">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={9} className="text-(--green)" strokeWidth={1.8} />
              <span className="text-[9px] text-(--hint) uppercase tracking-[.05em]">Earned</span>
            </div>
            <span className="font-mono text-[13px] font-medium text-(--green)">
              {parseFloat(agent.totalEarned).toFixed(2)}
            </span>
          </div>
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-1 mb-1">
              <Zap size={9} className="text-(--orange)" strokeWidth={1.8} />
              <span className="text-[9px] text-(--hint) uppercase tracking-[.05em]">Spent</span>
            </div>
            <span className="font-mono text-[13px] font-medium text-(--orange)">
              {parseFloat(agent.totalSpent).toFixed(2)}
            </span>
          </div>
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[9px] text-(--hint) uppercase tracking-[.05em]">Jobs</span>
            </div>
            <span className="font-mono text-[13px] font-medium text-foreground">
              {agent.jobsCompleted}
            </span>
          </div>
        </div>

        {/* Wallet address */}
        <div className="mx-4 mb-3.5 flex items-center gap-1.5 font-mono text-[10px] text-(--hint)">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isActive ? "bg-(--green)" : "bg-(--hint)"
            )}
          />
          {formatAddress(agent.walletAddress)}
          <span className="text-[rgba(255,255,255,0.15)]">·</span>
          <span>Base</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.25 rounded-[10px] text-[12px] font-medium bg-(--orange-dim) border border-(--orange-border) text-(--orange) hover:bg-[rgba(232,121,58,0.18)] transition-colors cursor-pointer"
          >
            <ArrowUpRight size={12} strokeWidth={1.8} />
            Withdraw
          </button>
          <button
            onClick={() => handleToggle(!isActive)}
            disabled={togglingStatus}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.25 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50",
              isActive
                ? "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.14)]"
                : "bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.18)] text-(--green) hover:bg-[rgba(34,197,94,0.13)]"
            )}
          >
            {togglingStatus ? (
              <Loader2 size={11} className="animate-spin" />
            ) : isActive ? (
              <Pause size={11} className="fill-current" strokeWidth={0} />
            ) : (
              <Play size={11} className="fill-current" strokeWidth={0} />
            )}
            {isActive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from {agent.name}</DialogTitle>
            <DialogDescription>
              Send USDT from the agent wallet to any address on Base.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-[.05em] mb-1.5 block">
                Destination address
              </label>
              <Input
                placeholder="0x..."
                value={withdrawTo}
                onChange={(e) => setWithdrawTo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-[.05em] mb-1.5 block">
                Amount (USDT)
              </label>
              <Input
                placeholder="e.g. 50.00"
                type="number"
                min="0"
                step="0.01"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)}
              />
            </div>
            {withdrawError && (
              <div className="text-[12px] text-red-400 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-[8px] px-3 py-2.5 leading-[1.5]">
                {withdrawError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              size="default"
              className="h-auto py-2.25 px-4 text-[13px]"
              onClick={() => setWithdrawOpen(false)}
              disabled={withdrawing}
            >
              Cancel
            </Button>
            <Button
              size="default"
              className="h-auto py-2.25 px-4 text-[13px] bg-(--orange) text-white hover:opacity-90"
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawTo || !withdrawAmt}
            >
              {withdrawing && <Loader2 size={13} className="animate-spin" />}
              {withdrawing ? "Sending..." : "Confirm withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
