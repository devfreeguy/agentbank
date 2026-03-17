"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MainTopbar } from "@/components/layout/MainTopbar";
import { JobBoardFilters, type FilterState } from "@/components/jobs/JobBoardFilters";
import { AgentGrid } from "@/components/jobs/AgentGrid";
import { AgentSlideOver } from "@/components/jobs/AgentSlideOver";
import { useAgents } from "@/hooks/useAgents";
import { useCategories } from "@/hooks/useCategories";
import { useUser } from "@/hooks/useUser";
import { useJobs } from "@/hooks/useJobs";
import type { AgentPublic, JobWithRelations } from "@/types/index";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "",
  price: "",
  sort: "rating",
};

export default function JobsPage() {
  const { agents, isLoadingAgents, fetchAgents } = useAgents();
  const { categories } = useCategories();
  const { user, address } = useUser();
  const { addJob } = useJobs();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedAgent, setSelectedAgent] = useState<AgentPublic | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  function handleSelectAgent(agent: AgentPublic) {
    setSelectedAgent(agent);
    setSlideOverOpen(true);
  }

  function handleJobAdded(job: JobWithRelations) {
    addJob(job);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const filtered = useMemo(() => {
    let list = [...agents];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.systemPrompt.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      const matchingIds = new Set<string>();
      for (const cat of categories) {
        if (cat.slug === filters.category) {
          matchingIds.add(cat.id);
          cat.subcategories.forEach((s) => matchingIds.add(s.id));
        }
        for (const sub of cat.subcategories) {
          if (sub.slug === filters.category) matchingIds.add(sub.id);
        }
      }
      list = list.filter((a) => a.categoryIds.some((id) => matchingIds.has(id)));
    }

    if (filters.price) {
      list = list.filter((a) => {
        const p = parseFloat(a.pricePerTask);
        if (filters.price === "u2") return p < 2;
        if (filters.price === "2to5") return p >= 2 && p <= 5;
        if (filters.price === "5to10") return p > 5 && p <= 10;
        if (filters.price === "10p") return p > 10;
        return true;
      });
    }

    list.sort((a, b) => {
      if (filters.sort === "rating") return b.rating - a.rating;
      if (filters.sort === "jobs") return b.jobsCompleted - a.jobsCompleted;
      if (filters.sort === "price") return parseFloat(a.pricePerTask) - parseFloat(b.pricePerTask);
      if (filters.sort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return list;
  }, [agents, filters, categories]);

  return (
    <>
      <MainTopbar
        title="Job Board"
        subtitle={
          <div className="inline-flex items-center gap-1.5 bg-(--green)/10 border border-(--green)/20 rounded-full px-2.75 py-1 text-[11px] text-(--green)">
            <div className="w-1.25 h-1.25 rounded-full bg-(--green)" />
            {filtered.length} agents available
          </div>
        }
      />

      <JobBoardFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      <div className="flex-1 overflow-y-auto px-6.5 py-5 pb-20 max-[560px]:px-3.5 max-[560px]:py-3.5">
        <AgentGrid
          agents={filtered}
          categories={categories}
          isLoading={isLoadingAgents}
          onSelectAgent={handleSelectAgent}
          onClearFilters={clearFilters}
        />
      </div>

      <AgentSlideOver
        agent={selectedAgent}
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        user={user}
        onJobAdded={handleJobAdded}
        showToast={(msg) => toast(msg)}
      />
    </>
  );
}
