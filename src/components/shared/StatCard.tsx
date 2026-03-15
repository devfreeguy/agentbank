import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5",
        className
      )}
    >
      <div className="font-head text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="text-[12px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
