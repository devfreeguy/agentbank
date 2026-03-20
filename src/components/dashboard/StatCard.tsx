import { cn } from "@/lib/utils";
import { TrendingUp, Zap, BarChart2, CheckSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardVariant = "green" | "orange" | "neutral" | "blue";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  sub?: React.ReactNode;
  variant?: StatCardVariant;
}

const config: Record<
  StatCardVariant,
  { icon: LucideIcon; glow: string; iconColor: string; valueColor: string; topBar: string }
> = {
  green: {
    icon: TrendingUp,
    glow: "radial-gradient(ellipse at top right, rgba(34,197,94,0.1) 0%, transparent 65%)",
    iconColor: "text-(--green)",
    valueColor: "text-(--green)",
    topBar: "bg-(--green)",
  },
  orange: {
    icon: Zap,
    glow: "radial-gradient(ellipse at top right, rgba(232,121,58,0.1) 0%, transparent 65%)",
    iconColor: "text-(--orange)",
    valueColor: "text-(--orange)",
    topBar: "bg-(--orange)",
  },
  neutral: {
    icon: BarChart2,
    glow: "radial-gradient(ellipse at top right, rgba(255,255,255,0.04) 0%, transparent 65%)",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
    topBar: "bg-[rgba(255,255,255,0.2)]",
  },
  blue: {
    icon: CheckSquare,
    glow: "radial-gradient(ellipse at top right, rgba(59,130,246,0.1) 0%, transparent 65%)",
    iconColor: "text-[#3b82f6]",
    valueColor: "text-[#3b82f6]",
    topBar: "bg-[#3b82f6]",
  },
};

export function StatCard({ label, value, unit, sub, variant = "neutral" }: StatCardProps) {
  const { icon: Icon, glow, iconColor, valueColor, topBar } = config[variant];

  return (
    <div className="relative bg-sidebar border border-[rgba(255,255,255,0.08)] rounded-[14px] px-4 pt-4 pb-3.5 overflow-hidden">
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-[1.5px]", topBar)} style={{ opacity: 0.6 }} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: glow }} />

      {/* Content */}
      <div className="relative">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-(--hint) uppercase tracking-[.07em] font-medium">
            {label}
          </span>
          <div className={cn("w-6 h-6 rounded-[7px] bg-[rgba(255,255,255,0.05)] flex items-center justify-center", iconColor)}>
            <Icon size={12} strokeWidth={1.8} />
          </div>
        </div>

        {/* Value */}
        <div className={cn("font-mono text-[24px] font-semibold leading-none mb-1", valueColor)}>
          {value}
        </div>

        {/* Unit + sub */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[10px] text-(--hint) uppercase tracking-[.04em]">{unit}</span>
          {sub && (
            <span className="text-[10px] text-muted-foreground">{sub}</span>
          )}
        </div>
      </div>
    </div>
  );
}
