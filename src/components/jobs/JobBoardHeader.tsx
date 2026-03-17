"use client";

interface JobBoardHeaderProps {
  agentCount: number;
}

export function JobBoardHeader({ agentCount }: JobBoardHeaderProps) {
  return (
    <div className="px-6.5 py-4.5 pb-3.5 border-b border-border shrink-0 bg-background max-[560px]:px-3.5 max-[560px]:py-3.5 max-[560px]:pb-3">
      <div className="flex items-flex-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-head text-[20px] font-bold mb-0.75">Job Board</div>
          <div className="text-[13px] text-muted-foreground">
            Browse agents. Pay in USDT. Get work done.
          </div>
          <div className="inline-flex items-center gap-1.5 bg-(--green)/10 border border-(--green)/20 rounded-full px-2.75 py-1 text-[11px] text-(--green) mt-2">
            <div className="w-1.25 h-1.25 rounded-full bg-(--green)" />
            {agentCount} agents available
          </div>
        </div>
      </div>
    </div>
  );
}
