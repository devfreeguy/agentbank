"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryWithSubs } from "@/types/index";

export type SortKey = "rating" | "jobs" | "price" | "newest";

export interface FilterState {
  search: string;
  category: string;
  price: string;
  sort: SortKey;
}

interface JobBoardFiltersProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  categories: CategoryWithSubs[];
}

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "u2", label: "Under 2 USDT" },
  { value: "2to5", label: "2–5 USDT" },
  { value: "5to10", label: "5–10 USDT" },
  { value: "10p", label: "10+ USDT" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "Top rated" },
  { value: "jobs", label: "Most jobs" },
  { value: "price", label: "Lowest price" },
  { value: "newest", label: "Newest" },
];

export function JobBoardFilters({
  filters,
  onFiltersChange,
  categories,
}: JobBoardFiltersProps) {
  const update = (patch: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const activeBadges: { key: keyof FilterState; label: string }[] = [];
  if (filters.search) activeBadges.push({ key: "search", label: `"${filters.search}"` });
  if (filters.category) {
    const catName =
      categories.find((c) => c.slug === filters.category)?.name ??
      categories
        .flatMap((c) => c.subcategories)
        .find((s) => s.slug === filters.category)?.name ??
      filters.category;
    activeBadges.push({ key: "category", label: catName });
  }
  if (filters.price) {
    const pLabel = PRICE_OPTIONS.find((o) => o.value === filters.price)?.label ?? filters.price;
    activeBadges.push({ key: "price", label: pLabel });
  }

  return (
    <div className="px-6.5 py-3 border-b border-border bg-sidebar flex items-center gap-2 flex-wrap shrink-0 max-[560px]:px-3.5 max-[560px]:py-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-40 max-w-65">
        <Search
          size={14}
          strokeWidth={1.4}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--hint) pointer-events-none z-10"
        />
        <Input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search agents..."
          className="pl-8 py-1.75 text-[13px] rounded-[8px]"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.category || "__all__"}
        onValueChange={(v) => update({ category: v === "__all__" ? "" : v })}
      >
        <SelectTrigger className="w-auto text-[12px] rounded-[8px] h-auto py-1.75 px-2.5 border-(--border-med) bg-card text-muted-foreground">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price */}
      <Select
        value={filters.price || "__any__"}
        onValueChange={(v) => update({ price: v === "__any__" ? "" : v })}
      >
        <SelectTrigger className="w-auto text-[12px] rounded-[8px] h-auto py-1.75 px-2.5 border-(--border-med) bg-card text-muted-foreground">
          <SelectValue placeholder="Any price" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_OPTIONS.map((o) => (
            <SelectItem key={o.value || "__any__"} value={o.value || "__any__"}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sort}
        onValueChange={(v) => update({ sort: v as SortKey })}
      >
        <SelectTrigger className="w-auto text-[12px] rounded-[8px] h-auto py-1.75 px-2.5 border-(--border-med) bg-card text-muted-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active filter badges */}
      {activeBadges.length > 0 && (
        <div className="flex gap-1.25 flex-wrap w-full">
          {activeBadges.map(({ key, label }) => (
            <Badge
              key={key}
              variant="orange"
              className={cn(
                "cursor-pointer hover:opacity-80 transition-opacity gap-1.25 py-0.75 px-2.25 text-[11px]"
              )}
              onClick={() =>
                update({ [key]: key === "sort" ? "rating" : "" } as Partial<FilterState>)
              }
            >
              {label}
              <X size={10} strokeWidth={2} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
