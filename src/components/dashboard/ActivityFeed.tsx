"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { useTransactions } from "@/hooks/useTransactions";
import type { AgentPublic } from "@/types/index";
import type { SerializedTransaction } from "@/utils/serialize";

interface ActivityFeedProps {
  agents: AgentPublic[];
}

type Filter = "all" | "EARNED" | "SPENT";

export function ActivityFeed({ agents }: ActivityFeedProps) {
  const { allTransactions, isLoading, fetchAllTransactions } = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  // Build a reverse-lookup map for agent names
  const agentNameMap = useMemo(
    () => Object.fromEntries(agents.map((a) => [a.id, a.name])),
    [agents]
  );

  const allTxns = useMemo(() => {
    return allTransactions
      .map((t: SerializedTransaction) => ({ ...t, agentName: agentNameMap[t.agentId] ?? "Agent" }))
      .slice(0, 10);
  }, [allTransactions, agentNameMap]);

  const filtered = useMemo(() => {
    if (filter === "all") return allTxns;
    return allTxns.filter((t) => t.type === filter);
  }, [allTxns, filter]);

  const hasData = allTransactions.length > 0;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "EARNED", label: "Earned" },
    { key: "SPENT", label: "Spent" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-head text-[14px] font-semibold">Recent activity</h2>
        <div className="flex gap-0.75">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-2.25 py-1 rounded-[5px] text-[11px] cursor-pointer border border-transparent transition-all font-body",
                filter === key
                  ? "bg-secondary text-foreground border-border"
                  : "text-muted-foreground hover:text-foreground bg-transparent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-sidebar border border-(--border-med) rounded-[14px] overflow-hidden">
        {isLoading && !hasData && (
          <div className="flex flex-col gap-2 p-3.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={cn("h-9 rounded-[6px]", i === 3 && "w-3/4")} />
            ))}
          </div>
        )}

        {!isLoading && hasData && filtered.length === 0 && (
          <div className="py-9 px-6 text-center">
            <div className="text-[26px] mb-2.5 opacity-35">📋</div>
            <div className="font-head text-[13px] font-semibold mb-1.25">No activity yet</div>
            <div className="text-[12px] text-muted-foreground">
              Transactions will appear here once your agents start working.
            </div>
          </div>
        )}

        {error && (
          <div className="py-7 px-6 text-center">
            <div className="text-[13px] text-red-500 mb-2">Could not load activity</div>
            <button
              onClick={() => { setError(false); fetchAllTransactions(true); }}
              className="text-[12px] px-3.5 py-1.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-[8px] text-red-500 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {filtered.map((t) => {
          const isEarned = t.type === "EARNED";
          return (
            <div
              key={t.id}
              className="flex items-center gap-2.5 px-4.5 py-2.5 border-b border-border last:border-b-0 hover:bg-card transition-colors cursor-default"
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isEarned ? "bg-[var(--green)]" : "bg-[var(--orange)]"
                )}
              />
              <span className="font-mono text-[10px] bg-secondary border border-border rounded-[4px] px-[6px] py-px text-[var(--hint)] flex-shrink-0">
                {t.agentName.slice(0, 6)}
              </span>
              <span className="flex-1 text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {t.description}
              </span>
              <span
                className={cn(
                  "font-mono text-[12px] font-medium flex-shrink-0",
                  isEarned ? "text-[var(--green)]" : "text-[var(--orange)]"
                )}
              >
                {isEarned ? "+" : "-"}{parseFloat(t.amountUsdt).toFixed(2)}
              </span>
              <span className="text-[11px] text-[var(--hint)] flex-shrink-0 w-[46px] text-right">
                {formatRelativeTime(t.createdAt).replace(" ago", "").replace(" mins", "m").replace(" min", "m").replace(" hours", "h").replace(" hour", "h").replace(" days", "d").replace(" day", "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
