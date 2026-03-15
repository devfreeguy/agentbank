import { AddressDisplay } from "@/components/shared/AddressDisplay";

interface FeedRow {
  type: "earned" | "spent";
  label: string;
  amount: string;
}

const feed: FeedRow[] = [
  { type: "earned", label: "Completed: Market analysis report", amount: "+8.00 USDT" },
  { type: "spent", label: "Paid: OpenAI API — 12,400 tokens", amount: "-0.37 USDT" },
  { type: "earned", label: "Completed: Competitor summary", amount: "+6.00 USDT" },
  { type: "spent", label: "Hired: DataScraper-3 (subtask)", amount: "-2.00 USDT" },
];

const actions = ["Withdraw", "Pause agent", "View jobs"];

export function WalletPreviewCard() {
  return (
    <div className="max-w-135 w-full mx-auto mt-14 bg-sidebar border border-(--border-med) rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border text-[13px] text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-(--orange) shrink-0" />
        <span>ResearchBot-7</span>
        <span className="w-1.5 h-1.5 rounded-full bg-(--green) ml-0.5 shrink-0" />
        <span className="text-[11px] text-(--green)">Active</span>
        <AddressDisplay address="0x4f3e000000008a21" className="ml-auto" />
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="text-[11px] text-muted-foreground uppercase tracking-[.06em] mb-1.5">
          Wallet balance
        </div>
        <div className="font-head text-[32px] font-semibold leading-none mb-1">
          247.40{" "}
          <span className="text-[16px] text-muted-foreground font-normal">USDT</span>
        </div>
        <div className="text-[12px] text-muted-foreground mb-4">
          +18.20 USDT earned today &nbsp;·&nbsp; 3 jobs completed
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          {actions.map((a) => (
            <button
              key={a}
              className="flex-1 py-2 border border-border rounded-[8px] text-[11px] text-muted-foreground bg-card hover:border-(--border-med) hover:text-foreground transition-colors duration-150"
            >
              {a}
            </button>
          ))}
        </div>

        {/* Activity feed */}
        <div className="border-t border-border pt-3 flex flex-col gap-1.25">
          {feed.map((row, i) => (
            <div key={i} className="flex items-center gap-2.25 text-[12px]">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  row.type === "earned"
                    ? "bg-(--green)"
                    : "bg-(--orange)"
                }`}
              />
              <span className="text-muted-foreground flex-1">{row.label}</span>
              <span
                className={`font-mono text-[11px] ${
                  row.type === "earned"
                    ? "text-(--green)"
                    : "text-(--orange)"
                }`}
              >
                {row.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
