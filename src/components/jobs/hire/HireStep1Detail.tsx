"use client";

import { useEffect, useState } from "react";
import { Copy, Zap, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUsdt } from "@/utils/format";
import type { AgentPublic } from "@/types/index";

interface AgentJobHistoryItem {
  id: string;
  taskDescription: string;
  createdAt: Date | string;
}

interface HireStep1DetailProps {
  agent: AgentPublic;
  isActive: boolean;
  avatarBg: string;
  initial: string;
  onHire: () => void;
  copyText: (text: string) => void;
}

export function HireStep1Detail({
  agent,
  isActive,
  avatarBg,
  initial,
  onHire,
  copyText,
}: HireStep1DetailProps) {
  const [history, setHistory] = useState<AgentJobHistoryItem[]>([]);

  useEffect(() => {
    fetch(`/api/agents/${agent.id}/jobs`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setHistory(res.data);
      })
      .catch(() => {});
  }, [agent.id]);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        {/* Hero */}
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-13 h-13 rounded-[13px] flex items-center justify-center shrink-0 font-head text-[22px] font-bold text-white"
            style={{ background: avatarBg }}
          >
            {initial}
          </div>
          <div>
            <div className="font-head text-[18px] font-semibold leading-tight mb-1">
              {agent.name}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-full border",
                  isActive
                    ? "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.18)] text-(--green)"
                    : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-(--hint)"
                )}
              >
                <span
                  className={cn(
                    "w-1.25 h-1.25 rounded-full",
                    isActive ? "bg-(--green)" : "bg-(--hint)"
                  )}
                />
                {isActive ? "Active" : "Paused"}
              </span>
              <Badge variant="orange">Base</Badge>
            </div>
          </div>
        </div>

        {/* System prompt */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[11px] p-4 mb-3">
          <div className="text-[10px] text-(--hint) uppercase tracking-[.06em] mb-2.5 font-medium">
            What I do
          </div>
          <div className="max-h-40 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-[12.5px] text-muted-foreground leading-[1.65] font-light mb-2 last:mb-0">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="text-foreground font-medium">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-[12.5px] text-muted-foreground space-y-0.5 mb-2 font-light">
                    {children}
                  </ul>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children }) => (
                  <code className="font-mono text-[11px] bg-[rgba(255,255,255,0.06)] text-foreground rounded px-1 py-0.5">
                    {children}
                  </code>
                ),
              }}
            >
              {agent.systemPrompt}
            </ReactMarkdown>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 rounded-[11px] overflow-hidden border border-[rgba(255,255,255,0.07)] divide-x divide-[rgba(255,255,255,0.07)] mb-3">
          <div className="px-3 py-2.5 bg-[rgba(251,191,36,0.04)]">
            <div className="text-[9px] text-(--hint) uppercase tracking-[.05em] mb-1">Rating</div>
            <div className="font-mono text-[14px] font-semibold text-amber-400">
              {agent.rating > 0 ? agent.rating.toFixed(1) : "—"}
            </div>
          </div>
          <div className="px-3 py-2.5">
            <div className="text-[9px] text-(--hint) uppercase tracking-[.05em] mb-1">Jobs</div>
            <div className="font-mono text-[14px] font-semibold text-foreground">
              {agent.jobsCompleted}
            </div>
          </div>
          <div className="px-3 py-2.5 bg-[rgba(232,121,58,0.04)]">
            <div className="text-[9px] text-(--hint) uppercase tracking-[.05em] mb-1">Price</div>
            <div className="font-mono text-[14px] font-semibold text-(--orange)">
              {formatUsdt(agent.pricePerTask)}
            </div>
          </div>
        </div>

        {/* Wallet address */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[11px] p-3.5 mb-3">
          <div className="text-[10px] text-(--hint) uppercase tracking-[.06em] mb-2 font-medium">
            Agent wallet
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-foreground break-all flex-1 leading-[1.6]">
              {agent.walletAddress}
            </span>
            <button
              onClick={() => copyText(agent.walletAddress)}
              className="w-6.5 h-6.5 rounded-[6px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer shrink-0 hover:border-[rgba(255,255,255,0.18)] transition-colors"
            >
              <Copy size={11} strokeWidth={1.3} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Job history */}
        {history.length > 0 && (
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[11px] overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-2.5 border-b border-[rgba(255,255,255,0.07)]">
              <Zap size={10} className="text-(--orange)" strokeWidth={1.6} />
              <span className="text-[10px] text-(--hint) uppercase tracking-[.06em] font-medium">
                Recent work · {history.length} job{history.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {history.slice(0, 6).map((job) => (
                <div key={job.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <Clock size={10} className="text-(--hint) mt-[3px] shrink-0" strokeWidth={1.5} />
                  <span className="text-[12px] text-muted-foreground font-light leading-[1.5] line-clamp-1">
                    {job.taskDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border bg-[#131316] shrink-0">
        <Button
          variant="primary"
          size="md"
          disabled={!isActive}
          onClick={onHire}
          className="w-full py-3 rounded-[10px] text-[14px] font-semibold tracking-[0.01em]"
        >
          <Zap size={14} strokeWidth={1.6} />
          {isActive ? "Hire this agent" : "Agent is paused"}
        </Button>
      </div>
    </>
  );
}
