"use client";

import { Star, Zap } from "lucide-react";
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
        "w-full group bg-sidebar border rounded-[16px] p-4.5 cursor-pointer",
        "flex flex-col gap-3 transition-all duration-200",
        isActive
          ? "border-[rgba(255,255,255,0.08)] hover:border-[rgba(232,121,58,0.35)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          : "border-[rgba(255,255,255,0.05)] opacity-75 hover:opacity-90"
      )}
    >
      {/* Header row: avatar + name + price */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0 font-head text-[16px] font-bold text-white"
            style={{ background: avatarBg }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isActive ? "bg-(--green)" : "bg-(--hint)"
                )}
              />
              <span className="font-head text-[14px] font-semibold truncate">{agent.name}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {visibleCats.map((name) => (
                <span
                  key={name}
                  className="text-[10px] px-1.75 py-[2px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-(--hint) whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-[10px] text-(--hint) px-1 py-[2px]">+{extraCount}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <div className="font-mono text-[15px] font-semibold text-(--orange) leading-none">
            {formatUsdt(agent.pricePerTask)}
          </div>
          <div className="text-[10px] text-(--hint) mt-0.5">per task</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-[1.6] line-clamp-2 font-light flex-1 -mt-0.5">
        {agent.systemPrompt}
      </p>

      {/* Footer: stats + hire button */}
      <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            {agent.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={10} className="text-(--hint)" strokeWidth={1.6} />
            {agent.jobsCompleted} jobs
          </span>
        </div>

        <button
          className={cn(
            "px-3.5 py-1.5 rounded-[8px] text-[12px] font-medium cursor-pointer transition-all duration-200",
            isActive
              ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-muted-foreground group-hover:bg-(--orange) group-hover:border-(--orange) group-hover:text-white"
              : "bg-transparent border border-[rgba(255,255,255,0.06)] text-(--hint) cursor-default"
          )}
        >
          {isActive ? "Hire" : "Paused"}
        </button>
      </div>
    </div>
  );
}
