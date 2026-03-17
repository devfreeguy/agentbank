"use client";

import { useState } from "react";
import { Receipt, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionGroup } from "@/components/transactions/TransactionGroup";
import { groupTransactions } from "@/utils/transactionFilters";
import type { SerializedTransaction } from "@/utils/serialize";

interface TransactionListProps {
  transactions: SerializedTransaction[];
  totalCount: number;
  agentMap: Record<string, string>;
  isLoading: boolean;
  hasError: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function TransactionList({
  transactions,
  totalCount,
  agentMap,
  isLoading,
  hasError,
  hasActiveFilters,
  onRetry,
  onClearFilters,
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (isLoading) {
    return <TransactionSkeleton />;
  }

  if (hasError) {
    return (
      <div className="bg-[rgba(239,68,68,0.04)] border-[0.5px] border-[rgba(239,68,68,0.15)] rounded-[14px] p-9 text-center mt-1">
        <AlertTriangle size={28} strokeWidth={1.3} className="mx-auto mb-3 text-red-500 opacity-60" />
        <h3 className="font-head text-[14px] font-semibold text-red-500 mb-1.5">
          Failed to load transactions
        </h3>
        <p className="text-[13px] text-muted-foreground font-light mb-4 max-w-[280px] mx-auto">
          We couldn&apos;t fetch your transaction history. This is usually a temporary network
          issue.
        </p>
        <Button
          onClick={onRetry}
          className="bg-[rgba(239,68,68,0.1)] border-[0.5px] border-[rgba(239,68,68,0.18)] text-red-500 hover:bg-[rgba(239,68,68,0.15)] text-[13px] h-auto px-[18px] py-2 rounded-[8px]"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center border-[0.5px] border-dashed border-(--border-med) rounded-[14px] mt-1">
        <Receipt
          size={30}
          strokeWidth={1.2}
          className="mb-3.5 text-muted-foreground opacity-40"
        />
        <h3 className="font-head text-[15px] font-semibold mb-[7px]">No transactions found</h3>
        <p className="text-[13px] text-muted-foreground font-light leading-[1.65] max-w-[280px]">
          Deploy an agent and complete your first task to see activity here.
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center border-[0.5px] border-dashed border-(--border-med) rounded-[14px] mt-1">
        <Receipt
          size={30}
          strokeWidth={1.2}
          className="mb-3.5 text-muted-foreground opacity-40"
        />
        <h3 className="font-head text-[15px] font-semibold mb-[7px]">No results</h3>
        <p className="text-[13px] text-muted-foreground font-light leading-[1.65] max-w-[280px] mb-4">
          No transactions match your current filters.
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-[13px] text-(--orange) hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  const groups = groupTransactions(transactions);

  return (
    <div>
      {/* Legend */}
      <div className="hidden min-[641px]:flex items-center gap-4 flex-wrap mb-3.5 px-3.5 py-3 bg-sidebar border-[0.5px] border-border rounded-[10px]">
        <span className="text-[10px] text-(--hint) uppercase tracking-[0.07em] font-medium">
          Legend:
        </span>
        <LegendItem color="var(--green)" label="Earned" />
        <LegendItem color="var(--orange)" label="Spent (API costs)" />
        <LegendItem color="#3b82f6" label="Withdrawal" />
        <LegendItem color="#8b5cf6" label="Agent-to-agent payment" />
      </div>

      {/* Column headers — desktop only */}
      <div className="hidden min-[900px]:flex items-center px-3.5 mb-0.5 pointer-events-none">
        <div className="w-6 flex-shrink-0" />
        <div className="w-26.5 shrink-0 text-[10px] text-(--hint) uppercase tracking-[0.07em]">
          Agent
        </div>
        <div className="flex-1 min-w-0 px-3.5 text-[10px] text-(--hint) uppercase tracking-[0.07em]">
          Description
        </div>
        <div className="w-[110px] flex-shrink-0 text-right text-[10px] text-(--hint) uppercase tracking-[0.07em]">
          Amount
        </div>
        <div className="w-[120px] flex-shrink-0 pl-3.5 text-right text-[10px] text-(--hint) uppercase tracking-[0.07em]">
          Tx hash
        </div>
        <div className="w-[60px] flex-shrink-0 text-right pl-2.5 text-[10px] text-(--hint) uppercase tracking-[0.07em]">
          Time
        </div>
      </div>

      {groups.map((g) => (
        <TransactionGroup
          key={g.label}
          label={g.label}
          transactions={g.transactions}
          agentMap={agentMap}
          expandedId={expandedId}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
      <span
        className="w-[7px] h-[7px] rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      {label}
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div>
      <SkeletonGroup label="Today" count={3} />
      <SkeletonGroup label="Yesterday" count={4} widths={["100%", "100%", "80%", "65%"]} />
    </div>
  );
}

function SkeletonGroup({
  label,
  count,
  widths,
}: {
  label: string;
  count: number;
  widths?: string[];
}) {
  return (
    <div className="mt-3.5">
      <div className="flex items-center gap-2.5 pt-5 pb-2">
        <span className="text-[11px] font-medium text-(--hint) uppercase tracking-[0.07em]">
          {label}
        </span>
        <div className="flex-1 h-[0.5px] bg-border" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-12 rounded-[10px] mb-1.5"
          style={{ width: widths?.[i] ?? "100%" }}
        />
      ))}
    </div>
  );
}
