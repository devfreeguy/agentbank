"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { MainTopbar } from "@/components/layout/MainTopbar";
import { TransactionStatsRow } from "@/components/transactions/TransactionStatsRow";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionTypePills } from "@/components/transactions/TransactionTypePills";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useUser } from "@/hooks/useUser";
import { useAgents } from "@/hooks/useAgents";
import { useTransactions } from "@/hooks/useTransactions";
import { matchesDateFilter, exportToCsv } from "@/utils/transactionFilters";
import type { DateFilter, TypeFilter } from "@/utils/transactionFilters";

export default function TransactionsPage() {
  const { user } = useUser();
  const { myAgents, fetchMyAgents } = useAgents();
  const { allTransactions, isLoading: isLoadingTxns, fetchAllTransactions } = useTransactions();

  const [agentFilter, setAgentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyAgents(user.id);
    }
  }, [user?.id, fetchMyAgents]);

  useEffect(() => {
    fetchAllTransactions().catch(() => setLoadError(true));
  }, [fetchAllTransactions]);

  // Build a name map for display purposes (agent name by ID)
  const agentMap = useMemo(
    () => Object.fromEntries(myAgents.map((a) => [a.id, a.name])),
    [myAgents]
  );

  const filteredTransactions = useMemo(
    () =>
      allTransactions.filter((t) => {
        if (agentFilter && t.agentId !== agentFilter) return false;
        if (!matchesDateFilter(t.createdAt, dateFilter)) return false;
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
        return true;
      }),
    [allTransactions, agentFilter, dateFilter, typeFilter, searchQuery]
  );

  const typeCounts = useMemo(() => {
    const counts = {
      all: allTransactions.length,
      EARNED: 0,
      SPENT: 0,
      WITHDRAWAL: 0,
      SUB_AGENT_PAYMENT: 0,
    };
    for (const t of allTransactions) {
      if (t.type in counts) counts[t.type as keyof typeof counts]++;
    }
    return counts;
  }, [allTransactions]);

  const hasActiveFilters = !!(
    agentFilter ||
    dateFilter !== "all" ||
    searchQuery ||
    typeFilter !== "all"
  );

  function handleClearFilters() {
    setAgentFilter("");
    setDateFilter("all");
    setSearchQuery("");
    setTypeFilter("all");
  }

  function handleRetry() {
    setLoadError(false);
    fetchAllTransactions(true).catch(() => setLoadError(true));
  }

  return (
    <>
      <MainTopbar
        title="Transactions"
        subtitle={
          <p className="text-[13px] text-muted-foreground">
            Your complete payment history — earnings, spending, and withdrawals
          </p>
        }
        actions={
          <button
            onClick={() => exportToCsv(filteredTransactions, agentMap)}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-[7px] px-4 py-[9px] bg-card border-[0.5px] border-(--border-med) rounded-[8px] text-[13px] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.18)] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} strokeWidth={1.4} />
            Export CSV
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto px-[26px] py-5 pb-20 max-[640px]:px-3.5 max-[640px]:py-3.5 [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        <TransactionStatsRow transactions={allTransactions} />

        <TransactionFilters
          agents={myAgents}
          agentFilter={agentFilter}
          dateFilter={dateFilter}
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
          onAgentChange={setAgentFilter}
          onDateChange={setDateFilter}
          onSearchChange={setSearchQuery}
          onClear={handleClearFilters}
        />

        <TransactionTypePills
          activeType={typeFilter}
          counts={typeCounts}
          onChange={setTypeFilter}
        />

        <TransactionList
          transactions={filteredTransactions}
          totalCount={allTransactions.length}
          agentMap={agentMap}
          isLoading={isLoadingTxns}
          hasError={loadError}
          hasActiveFilters={hasActiveFilters}
          onRetry={handleRetry}
          onClearFilters={handleClearFilters}
        />
      </main>
    </>
  );
}
