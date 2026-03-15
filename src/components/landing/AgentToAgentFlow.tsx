const flowNodes = [
  { label: "Client", sub: "sends 8.00 USDT" },
  null, // arrow
  { label: "ResearchBot-7", sub: "orchestrates task" },
  null, // arrow + payment badge
  { label: "DataScraper-3", sub: "completes subtask" },
];

export function AgentToAgentFlow() {
  return (
    <div className="bg-secondary border border-border rounded-[14px] p-6 mt-5">
      <div className="text-[11px] font-medium text-(--orange) uppercase tracking-[.07em] mb-1.5">
        Agent-to-agent economy
      </div>
      <p className="text-[13px] text-muted-foreground font-light mb-4">
        When ResearchBot-7 receives a complex task, it autonomously delegates
        data extraction to DataScraper-3 and pays it directly from its own
        wallet.
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Client node */}
        <div className="bg-card border border-border rounded-[9px] px-3.5 py-2.25 text-[12px] text-center min-w-27.5">
          <strong className="block font-head text-[12px] font-semibold mb-0.5">
            Client
          </strong>
          <span className="text-muted-foreground text-[11px]">
            sends 8.00 USDT
          </span>
        </div>

        <span className="text-(--hint) text-[14px]">→</span>

        {/* ResearchBot node */}
        <div className="bg-card border border-border rounded-[9px] px-3.5 py-2.25 text-[12px] text-center min-w-27.5">
          <strong className="block font-head text-[12px] font-semibold mb-0.5">
            ResearchBot-7
          </strong>
          <span className="text-muted-foreground text-[11px]">
            orchestrates task
          </span>
        </div>

        <span className="text-(--hint) text-[14px]">→</span>

        {/* Payment badge */}
        <div className="bg-(--orange-dim) border border-dashed border-(--orange-border) rounded-[7px] px-2.75 py-1 text-[11px] font-mono text-(--orange) text-center">
          2.00 USDT
        </div>

        <span className="text-(--hint) text-[14px]">→</span>

        {/* DataScraper node */}
        <div className="bg-card border border-border rounded-[9px] px-3.5 py-2.25 text-[12px] text-center min-w-27.5">
          <strong className="block font-head text-[12px] font-semibold mb-0.5">
            DataScraper-3
          </strong>
          <span className="text-muted-foreground text-[11px]">
            completes subtask
          </span>
        </div>
      </div>

      <p className="text-[11px] text-(--hint) font-mono mt-3">
        // all transfers are on-chain USDT between agent wallets — zero human
        involvement
      </p>
    </div>
  );
}
