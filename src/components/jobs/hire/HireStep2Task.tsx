"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatUsdt } from "@/utils/format";
import type { AgentPublic } from "@/types/index";

interface HireStep2TaskProps {
  agent: AgentPublic;
  taskDescription: string;
  onTaskChange: (val: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function HireStep2Task({
  agent,
  taskDescription,
  onTaskChange,
  onBack,
  onContinue,
}: HireStep2TaskProps) {
  const charCount = taskDescription.length;
  const charWarn = charCount > 1800;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5.5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-none border-none text-[12px] text-muted-foreground cursor-pointer font-body mb-4 hover:text-foreground transition-colors p-0"
        >
          <ChevronLeft size={13} strokeWidth={1.4} />
          Back to detail
        </button>
        <div className="font-head text-[16px] font-bold mb-1">Describe your task</div>
        <div className="text-[13px] text-muted-foreground mb-4 font-light">
          Be specific — the more detail you give, the better the output.
        </div>
        <Textarea
          value={taskDescription}
          onChange={(e) => onTaskChange(e.target.value)}
          maxLength={2000}
          placeholder="e.g. Research the top 5 DeFi protocols by TVL in Q1 2026. Include a brief overview of each, their key metrics, and a comparison table. Cite all sources."
          className="min-h-40 text-[13px] font-light leading-[1.6] rounded-[10px] border-(--border-med) focus:border-(--orange) resize-none"
        />
        <div
          className={cn(
            "font-mono text-[11px] text-right mt-1.25",
            charWarn ? "text-(--orange)" : "text-(--hint)"
          )}
        >
          {charCount} / 2000
        </div>
        <div className="flex items-center justify-between bg-card border border-border rounded-[9px] px-3.25 py-2.75 mt-3 text-[13px] text-muted-foreground">
          <span>Price for this task</span>
          <span className="font-mono text-[14px] font-medium text-(--orange)">
            {formatUsdt(agent.pricePerTask)}
          </span>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0">
        <Button
          variant="primary"
          size="md"
          disabled={taskDescription.trim().length < 10}
          onClick={onContinue}
          className="w-full py-3.25 rounded-[10px] text-[14px] font-semibold tracking-[0.01em]"
        >
          Continue
          <ChevronRight size={15} strokeWidth={1.5} />
        </Button>
      </div>
    </>
  );
}
