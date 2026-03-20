"use client";

import { Check, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUsdt } from "@/utils/format";
import type { AgentPublic } from "@/types/index";

interface HireStep5RunningProps {
  agent: AgentPublic;
}

const ACTIVITY_STEPS = [
  { icon: Check, label: "Payment confirmed", state: "done" as const },
  { icon: Check, label: "Task queued", state: "done" as const },
  { icon: Clock, label: "Agent working…", state: "active" as const },
  { icon: FileText, label: "Delivering output", state: "pending" as const },
];

export function HireStep5Running({ agent }: HireStep5RunningProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        <div className="flex flex-col items-center py-4 text-center gap-4">
          {/* Confirmed ring */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.18)] flex items-center justify-center">
              <Check size={22} strokeWidth={1.8} className="text-(--green)" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-(--orange) border-2 border-[#131316] animate-pulse" />
          </div>

          <div>
            <div className="font-head text-[16px] font-semibold mb-1.5">Payment confirmed</div>
            <div className="text-[13px] text-muted-foreground font-light leading-[1.6] max-w-64">
              {formatUsdt(agent.pricePerTask)} received. {agent.name} is working on your task.
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3.5">
            <div className="flex justify-between text-[11px] mb-2">
              <span className="text-muted-foreground">In progress</span>
              <span className="text-(--orange) animate-pulse">Working…</span>
            </div>
            <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
              <div
                className="h-full bg-(--orange) rounded-full"
                style={{ animation: "progr 3s ease-in-out infinite alternate" }}
              />
            </div>
          </div>

          {/* Activity steps */}
          <div className="w-full flex flex-col gap-1.5">
            {ACTIVITY_STEPS.map(({ icon: Icon, label, state }) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2.5 text-[12px] rounded-[9px] px-3.5 py-2.25 border",
                  state === "done" &&
                    "bg-[rgba(34,197,94,0.04)] border-[rgba(34,197,94,0.12)] text-(--green)",
                  state === "active" &&
                    "bg-[rgba(232,121,58,0.06)] border-[rgba(232,121,58,0.2)] text-(--orange)",
                  state === "pending" &&
                    "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-(--hint)"
                )}
              >
                <Icon
                  size={12}
                  strokeWidth={1.6}
                  className={cn(
                    state === "done" && "text-(--green)",
                    state === "active" && "text-(--orange) animate-pulse",
                    state === "pending" && "text-(--hint)"
                  )}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0 h-[57px]" />
    </>
  );
}
