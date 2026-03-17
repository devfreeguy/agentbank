"use client";

import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAddress, formatUsdt } from "@/utils/format";
import { getAvatarColor } from "@/utils/avatarColor";
import type { AgentPublic, CategoryWithSubs } from "@/types/index";
import { AgentStatus } from "@/generated/prisma/enums";

interface AgentCardProps {
  agent: AgentPublic;
  categories: CategoryWithSubs[];
  onClick: () => void;
}

function resolveCategoryName(idOrSlug: string, categories: CategoryWithSubs[]): string | null {
  for (const cat of categories) {
    if (cat.id === idOrSlug || cat.slug === idOrSlug) return cat.name;
    for (const sub of cat.subcategories) {
      if (sub.id === idOrSlug || sub.slug === idOrSlug) return sub.name;
    }
  }
  return null;
}

export function AgentCard({ agent, categories, onClick }: AgentCardProps) {
  const isActive = agent.status === AgentStatus.ACTIVE;
  const avatarBg = getAvatarColor(agent.id);
  const initial = agent.name.charAt(0).toUpperCase();

  const resolvedCats = agent.categoryIds
    .map((id) => resolveCategoryName(id, categories))
    .filter(Boolean) as string[];
  const visibleCats = resolvedCats.slice(0, 2);
  const extraCount = resolvedCats.length - visibleCats.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full group bg-sidebar border border-(--border-med) rounded-[14px] p-4.5 cursor-pointer",
        "flex flex-col transition-all duration-200",
        "hover:border-(--orange) hover:-translate-y-px"
      )}
    >
      {/* Top: avatar + title */}
      <div className="flex items-start mb-3">
        <div
          className="w-10.5 h-10.5 rounded-[11px] flex items-center justify-center shrink-0 font-head text-[16px] font-bold text-foreground"
          style={{ background: avatarBg }}
        >
          {initial}
        </div>
        
        <div className="flex-1 ml-2.5">
          <div className="font-head text-[14px] font-bold flex items-center gap-1.5 leading-[1.2]">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isActive ? "bg-(--green)" : "bg-(--hint)"
              )}
            />
            {agent.name}
          </div>

          <div className="flex gap-1 flex-wrap mt-1.25">
            {visibleCats.map((name) => (
              <span
                key={name}
                className="text-[10px] px-1.75 py-0.5 rounded-full bg-secondary border border-border text-(--hint) whitespace-nowrap"
              >
                {name}
              </span>
            ))}

            {extraCount > 0 && (
              <span className="text-[10px] text-(--hint) px-1.25 py-0.5">
                +{extraCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-[1.55] mb-3 flex-1 font-light line-clamp-2">
        {agent.systemPrompt}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-2.5 mb-3 text-[12px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-0.75">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          {agent.rating.toFixed(1)}
        </span>
        <span>·</span>
        <span>{agent.jobsCompleted} jobs</span>
        <span className="font-mono text-[13px] font-medium text-foreground ml-auto">
          {formatUsdt(agent.pricePerTask)}
        </span>
      </div>

      {/* Wallet address */}
      <div className="font-mono text-[10px] text-(--hint) bg-card border border-border rounded-[6px] px-2 py-1 mb-3 flex items-center gap-1.25 overflow-hidden">
        <div
          className={cn(
            "w-1 h-1 rounded-full shrink-0",
            isActive ? "bg-(--green)" : "bg-(--hint)"
          )}
        />
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {formatAddress(agent.walletAddress)}
        </span>
      </div>

      {/* Hire button */}
      <button
        className={cn(
          "w-full py-2.5 bg-card border border-(--border-med) rounded-[9px]",
          "text-[13px] font-medium text-muted-foreground font-body cursor-pointer",
          "flex items-center justify-center gap-1.5 transition-all duration-200",
          "group-hover:bg-(--orange) group-hover:border-(--orange) group-hover:text-white",
          !isActive && "opacity-60"
        )}
      >
        <Plus size={13} strokeWidth={1.5} />
        {isActive ? "Hire agent" : "Currently paused"}
      </button>
    </div>
  );
}
