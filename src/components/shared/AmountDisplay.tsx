import { cn } from "@/lib/utils";

type AmountType = "earned" | "spent" | "neutral";

interface AmountDisplayProps {
  amount: string | number;
  type?: AmountType;
  className?: string;
}

const typeStyles: Record<AmountType, string> = {
  earned: "text-[var(--green)]",
  spent: "text-[var(--orange)]",
  neutral: "text-foreground",
};

export function AmountDisplay({
  amount,
  type = "neutral",
  className,
}: AmountDisplayProps) {
  const formatted = `${parseFloat(String(amount)).toFixed(2)} USDT`;

  return (
    <span className={cn("text-[13px] font-medium", typeStyles[type], className)}>
      {formatted}
    </span>
  );
}
