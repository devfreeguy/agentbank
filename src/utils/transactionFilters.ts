import type { SerializedTransaction } from "@/utils/serialize";

export type DateFilter = "all" | "today" | "week" | "month";
export type TypeFilter = "all" | "EARNED" | "SPENT" | "WITHDRAWAL" | "SUB_AGENT_PAYMENT";

export const DATE_GROUP_ORDER = ["Today", "Yesterday", "This week", "Older"] as const;
export type DateGroup = (typeof DATE_GROUP_ORDER)[number];

export function getDateGroup(date: Date | string): DateGroup {
  const ms = Date.now() - new Date(date).getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) return "Today";
  if (hours < 48) return "Yesterday";
  if (hours < 7 * 24) return "This week";
  return "Older";
}

export function matchesDateFilter(date: Date | string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const ms = Date.now() - new Date(date).getTime();
  const hours = ms / (1000 * 60 * 60);
  if (filter === "today") return hours < 24;
  if (filter === "week") return hours < 7 * 24;
  if (filter === "month") return hours < 30 * 24;
  return true;
}

export function groupTransactions(
  transactions: SerializedTransaction[]
): { label: DateGroup; transactions: SerializedTransaction[] }[] {
  const groups: Partial<Record<DateGroup, SerializedTransaction[]>> = {};
  for (const t of transactions) {
    const g = getDateGroup(t.createdAt);
    if (!groups[g]) groups[g] = [];
    groups[g]!.push(t);
  }
  return DATE_GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({
    label: g,
    transactions: groups[g]!,
  }));
}

export function exportToCsv(
  transactions: SerializedTransaction[],
  agentMap: Record<string, string>
): void {
  const header = "Date,Agent,Type,Description,Amount (USDT),Tx Hash";
  const rows = transactions.map((t) =>
    [
      new Date(t.createdAt).toISOString(),
      `"${(agentMap[t.agentId] ?? t.agentId).replace(/"/g, '""')}"`,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      parseFloat(t.amountUsdt).toFixed(2),
      t.txHash ?? "",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
