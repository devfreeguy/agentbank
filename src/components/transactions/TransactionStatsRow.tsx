"use client";

import type { SerializedTransaction } from "@/utils/serialize";

interface Props {
  transactions: SerializedTransaction[];
}

export function TransactionStatsRow({ transactions }: Props) {
  const earned = transactions
    .filter((t) => t.type === "EARNED")
    .reduce((s, t) => s + parseFloat(t.amountUsdt), 0);

  const spent = transactions
    .filter((t) => t.type === "SPENT" || t.type === "SUB_AGENT_PAYMENT")
    .reduce((s, t) => s + parseFloat(t.amountUsdt), 0);

  const net = earned - spent;
  const margin = earned > 0 ? ((net / earned) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-3 max-[640px]:grid-cols-2 gap-3 mb-5">
      <div className="relative overflow-hidden bg-sidebar border-[0.5px] border-(--border-med) rounded-[14px] p-[18px] pb-[14px]">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--green)" />
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.06em] mb-[9px]">
          Total earned
        </div>
        <div className="font-mono text-[22px] font-medium leading-none mb-1 text-(--green)">
          {earned.toFixed(2)}
        </div>
        <div className="text-[10px] text-(--hint) font-mono mb-[5px]">USDT all time</div>
      </div>

      <div className="relative overflow-hidden bg-sidebar border-[0.5px] border-(--border-med) rounded-[14px] p-[18px] pb-[14px]">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--orange)" />
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.06em] mb-[9px]">
          Total spent
        </div>
        <div className="font-mono text-[22px] font-medium leading-none mb-1 text-(--orange)">
          {spent.toFixed(2)}
        </div>
        <div className="text-[10px] text-(--hint) font-mono mb-[5px]">USDT all time</div>
      </div>

      <div className="relative overflow-hidden bg-sidebar border-[0.5px] border-(--border-med) rounded-[14px] p-[18px] pb-[14px] max-[640px]:[grid-column:1/-1]">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[rgba(255,255,255,0.18)]" />
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.06em] mb-[9px]">
          Net profit
        </div>
        <div className="font-mono text-[22px] font-medium leading-none mb-1 text-foreground">
          {net.toFixed(2)}
        </div>
        <div className="text-[10px] text-(--hint) font-mono mb-[5px]">USDT all time</div>
        <div className="text-[11px] text-(--hint)">{margin}% margin</div>
      </div>
    </div>
  );
}
