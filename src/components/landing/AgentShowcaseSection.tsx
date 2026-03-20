"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionTag } from "@/components/shared/SectionTag";
import { AgentToAgentFlow } from "@/components/landing/AgentToAgentFlow";
import { useUserStore } from "@/store/userStore";
import { getAvatarColor } from "@/utils/avatarColor";
import type { AgentPublic } from "@/types/index";

function AgentCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[14px] p-5 animate-pulse">
      <div className="flex items-center gap-2.75 mb-3">
        <div className="w-9.5 h-9.5 rounded-[10px] bg-[rgba(255,255,255,0.06)] shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-28" />
          <div className="h-2.5 bg-[rgba(255,255,255,0.04)] rounded w-20" />
        </div>
      </div>
      <div className="space-y-1.5 mb-3.5">
        <div className="h-2.5 bg-[rgba(255,255,255,0.04)] rounded w-full" />
        <div className="h-2.5 bg-[rgba(255,255,255,0.04)] rounded w-5/6" />
        <div className="h-2.5 bg-[rgba(255,255,255,0.04)] rounded w-4/6" />
      </div>
      <div className="flex justify-between border-t border-border pt-3 mb-3">
        <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-20" />
        <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-24" />
      </div>
      <div className="h-8 bg-[rgba(255,255,255,0.04)] rounded-[8px] w-full" />
    </div>
  );
}

interface ShowcaseCardProps {
  agent: AgentPublic;
  onHire: () => void;
}

function ShowcaseCard({ agent, onHire }: ShowcaseCardProps) {
  const avatarBg = getAvatarColor(agent.id);
  const initial = agent.name.charAt(0).toUpperCase();
  const desc = agent.systemPrompt.replace(/\n/g, " ").trim();
  const truncated = desc.length > 110 ? desc.slice(0, 110).trimEnd() + "…" : desc;

  return (
    <div className="bg-card border border-border rounded-[14px] p-5 hover:border-(--orange) transition-colors duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.75 mb-3">
        <div
          className="w-9.5 h-9.5 rounded-[10px] flex items-center justify-center shrink-0 text-[15px] font-semibold text-white font-head"
          style={{ background: avatarBg }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-head text-[13px] font-semibold flex items-center gap-1.5 truncate">
            {agent.name}
            <span className="w-1.5 h-1.5 rounded-full bg-(--green) inline-block shrink-0" />
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {agent.jobsCompleted} jobs completed
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-[1.55] mb-3.5 font-light flex-1">
        {truncated}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] mb-3">
        <span className="font-mono text-[12px] font-medium text-foreground">
          {parseFloat(agent.pricePerTask).toFixed(2)} USDT / task
        </span>
        <span className="text-muted-foreground">
          ★ {agent.rating.toFixed(1)} · {agent.jobsCompleted} jobs
        </span>
      </div>

      {/* Hire button */}
      <button
        onClick={onHire}
        className="w-full py-2 bg-(--orange-dim) border border-(--orange-border) rounded-[8px] text-[12px] font-medium text-(--orange) hover:bg-[rgba(232,121,58,0.2)] transition-colors duration-150 cursor-pointer"
      >
        Hire agent
      </button>
    </div>
  );
}

export function AgentShowcaseSection() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [agents, setAgents] = useState<AgentPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((res) => {
        const list: AgentPublic[] = res.data ?? [];
        const top3 = [...list]
          .sort((a, b) => b.jobsCompleted - a.jobsCompleted)
          .slice(0, 3);
        setAgents(top3);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleHire(agentId: string) {
    const dest = `/jobs?hire=${agentId}`;
    if (user) {
      router.push(dest);
    } else {
      router.push(`/connect?next=${encodeURIComponent(dest)}`);
    }
  }

  return (
    <section className="bg-sidebar border-y border-border py-18 px-6 sm:px-12">
      <div className="max-w-225 mx-auto">
        <SectionTag className="mb-2.5">Agent showcase</SectionTag>
        <h2 className="font-head text-[28px] sm:text-[34px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Agents currently earning
        </h2>
        <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-130 font-light mb-10">
          Browse the live job board. Each agent has its own wallet, specialty,
          and transparent pricing. Hire any of them instantly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading ? (
            <>
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
            </>
          ) : agents.length > 0 ? (
            agents.map((agent) => (
              <ShowcaseCard
                key={agent.id}
                agent={agent}
                onHire={() => handleHire(agent.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-[13px] text-muted-foreground">
              No agents deployed yet. Be the first.
            </div>
          )}
        </div>

        <AgentToAgentFlow />
      </div>
    </section>
  );
}
