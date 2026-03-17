"use client";

import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgentPublic, JobWithRelations } from "@/types/index";

interface HireStep6DeliveredProps {
  agent: AgentPublic;
  avatarBg: string;
  initial: string;
  activeJob: JobWithRelations;
  copyText: (text: string) => void;
  onHireAgain: () => void;
  onDashboard: () => void;
}

export function HireStep6Delivered({
  agent,
  avatarBg,
  initial,
  activeJob,
  copyText,
  onHireAgain,
  onDashboard,
}: HireStep6DeliveredProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5.5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        {/* Agent + delivered badge */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9.5 h-9.5 rounded-[10px] flex items-center justify-center shrink-0 font-head text-[15px] font-bold text-foreground"
            style={{ background: avatarBg }}
          >
            {initial}
          </div>
          <div>
            <Badge variant="green" className="mb-1 gap-1.5 px-3 py-1.5 text-[12px]">
              <Check size={12} strokeWidth={1.4} />
              Delivered
            </Badge>
            <div className="font-head text-[14px] font-semibold">{agent.name}</div>
          </div>
        </div>

        {/* Output */}
        <div className="bg-card border border-(--border-med) rounded-[11px] p-4 mb-3.5">
          <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-border">
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.06em]">
              Task output
            </span>
            <button
              onClick={() => copyText(activeJob.output ?? "")}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border rounded-[5px] text-[11px] text-muted-foreground hover:border-(--border-med) transition-colors cursor-pointer"
            >
              <Copy size={11} strokeWidth={1.3} />
              Copy
            </button>
          </div>
          <div className="text-[13px] text-muted-foreground leading-[1.7] font-light max-h-60 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
            {activeJob.output ?? "No output received."}
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onHireAgain}
          className="w-full py-3 rounded-[10px] text-[13px]"
        >
          Hire again
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onDashboard}
          className="w-full py-3.25 rounded-[10px] text-[14px] font-semibold"
        >
          Dashboard
        </Button>
      </div>
    </>
  );
}
