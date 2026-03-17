"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { AgentPublic } from "@/types/index";
import type { DateFilter } from "@/utils/transactionFilters";

interface TransactionFiltersProps {
  agents: AgentPublic[];
  agentFilter: string;
  dateFilter: DateFilter;
  searchQuery: string;
  hasActiveFilters: boolean;
  onAgentChange: (value: string) => void;
  onDateChange: (value: DateFilter) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function TransactionFilters({
  agents,
  agentFilter,
  dateFilter,
  searchQuery,
  hasActiveFilters,
  onAgentChange,
  onDateChange,
  onSearchChange,
  onClear,
}: TransactionFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      <Select value={agentFilter || "_all"} onValueChange={(v) => onAgentChange(v === "_all" ? "" : v)}>
        <SelectTrigger className="w-[150px] h-[34px] bg-card border-[0.5px] border-(--border-med) rounded-[8px] text-[12px] text-muted-foreground px-3 focus:ring-0 focus:border-(--orange) focus:text-foreground">
          <SelectValue placeholder="All agents" />
        </SelectTrigger>
        <SelectContent className="bg-sidebar border-(--border-med) rounded-[10px]">
          <SelectItem value="_all" className="text-[12px]">
            All agents
          </SelectItem>
          {agents.map((a) => (
            <SelectItem key={a.id} value={a.id} className="text-[12px]">
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={(v) => onDateChange(v as DateFilter)}>
        <SelectTrigger className="w-[130px] h-[34px] bg-card border-[0.5px] border-(--border-med) rounded-[8px] text-[12px] text-muted-foreground px-3 focus:ring-0 focus:border-(--orange) focus:text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-sidebar border-(--border-med) rounded-[10px]">
          <SelectItem value="all" className="text-[12px]">All time</SelectItem>
          <SelectItem value="today" className="text-[12px]">Today</SelectItem>
          <SelectItem value="week" className="text-[12px]">This week</SelectItem>
          <SelectItem value="month" className="text-[12px]">This month</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[160px] max-w-[240px]">
        <Search
          size={13}
          strokeWidth={1.4}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--hint) pointer-events-none"
        />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transactions…"
          className="pl-[30px] h-[34px] bg-card border-[0.5px] border-(--border-med) rounded-[8px] text-[12px] placeholder:text-(--hint) focus-visible:ring-0 focus-visible:border-(--orange)"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="text-[12px] text-(--hint) hover:text-muted-foreground transition-colors cursor-pointer px-2 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
