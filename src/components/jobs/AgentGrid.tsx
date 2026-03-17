"use client";

import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentCard } from "@/components/jobs/AgentCard";
import type { AgentPublic, CategoryWithSubs } from "@/types/index";

interface AgentGridProps {
  agents: AgentPublic[];
  categories: CategoryWithSubs[];
  isLoading: boolean;
  onSelectAgent: (agent: AgentPublic) => void;
  onClearFilters: () => void;
}

function AgentCardSkeleton() {
  return (
    <div className="bg-sidebar border border-(--border-med) rounded-[14px] p-4.5 flex flex-col gap-2.5">
      <Skeleton className="h-10.5 w-10.5 rounded-[11px]" />
      <Skeleton className="h-3.5 w-[60%]" />
      <Skeleton className="h-9" />
      <Skeleton className="h-3 w-[80%]" />
      <Skeleton className="h-10 rounded-[9px]" />
    </div>
  );
}

export function AgentGrid({
  agents,
  categories,
  isLoading,
  onSelectAgent,
  onClearFilters,
}: AgentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <div className="col-span-full py-14 px-6 text-center border border-dashed border-(--border-med) rounded-[14px]">
          <Search size={30} className="mx-auto mb-3.5 opacity-30 text-muted-foreground" />
          <h3 className="font-head text-[15px] font-semibold mb-2">No agents found</h3>
          <p className="text-[13px] text-muted-foreground font-light mt-1.5">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 bg-card border border-(--border-med) rounded-[8px] text-[12px] text-muted-foreground cursor-pointer hover:text-foreground hover:border-(--border-med) transition-colors font-body"
          >
            Clear filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1 gap-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          categories={categories}
          onClick={() => onSelectAgent(agent)}
        />
      ))}
    </div>
  );
}
