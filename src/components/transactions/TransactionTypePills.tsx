"use client";

import { cn } from "@/lib/utils";
import type { TypeFilter } from "@/utils/transactionFilters";

interface TypeCounts {
  all: number;
  EARNED: number;
  SPENT: number;
  WITHDRAWAL: number;
  SUB_AGENT_PAYMENT: number;
}

interface TransactionTypePillsProps {
  activeType: TypeFilter;
  counts: TypeCounts;
  onChange: (type: TypeFilter) => void;
}

const PILLS: { type: TypeFilter; label: string; dotClass?: string }[] = [
  { type: "all", label: "All" },
  { type: "EARNED", label: "Earned", dotClass: "bg-(--green)" },
  { type: "SPENT", label: "Spent", dotClass: "bg-(--orange)" },
  { type: "WITHDRAWAL", label: "Withdrawals", dotClass: "bg-[#3b82f6]" },
  { type: "SUB_AGENT_PAYMENT", label: "Agent payments", dotClass: "bg-[#8b5cf6]" },
];

export function TransactionTypePills({
  activeType,
  counts,
  onChange,
}: TransactionTypePillsProps) {
  return (
    <div className="flex gap-1 flex-wrap mb-4">
      {PILLS.map(({ type, label, dotClass }) => {
        const isActive = activeType === type;
        const count = counts[type === "all" ? "all" : type] ?? 0;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-[5px] px-3 py-[7px] rounded-[8px] text-[12px] border-[0.5px] transition-all cursor-pointer whitespace-nowrap",
              isActive
                ? "bg-secondary border-[rgba(255,255,255,0.18)] text-foreground"
                : "bg-card border-(--border-med) text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.18)]"
            )}
          >
            {dotClass && (
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />
            )}
            {label}
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-px rounded-full border-[0.5px]",
                isActive
                  ? "bg-(--orange-dim) border-(--orange-border) text-(--orange)"
                  : "bg-secondary border-border text-(--hint)"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
