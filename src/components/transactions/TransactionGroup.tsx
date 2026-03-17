"use client";

import { TransactionRow } from "@/components/transactions/TransactionRow";
import type { SerializedTransaction } from "@/utils/serialize";

interface TransactionGroupProps {
  label: string;
  transactions: SerializedTransaction[];
  agentMap: Record<string, string>;
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function TransactionGroup({
  label,
  transactions,
  agentMap,
  expandedId,
  onToggle,
}: TransactionGroupProps) {
  return (
    <div>
      {/* Group header */}
      <div className="flex items-center gap-2.5 pt-5 pb-2">
        <span className="text-[11px] font-medium text-(--hint) uppercase tracking-[0.07em] whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-[0.5px] bg-border" />
        <span className="text-[10px] text-(--hint) font-mono whitespace-nowrap">
          {transactions.length} txn{transactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rows */}
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          agentName={agentMap[tx.agentId] ?? tx.agentId}
          isExpanded={expandedId === tx.id}
          onToggle={() => onToggle(tx.id)}
        />
      ))}
    </div>
  );
}
