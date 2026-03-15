import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  className?: string;
}

export function AddressDisplay({ address, className }: AddressDisplayProps) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <span className={cn("font-mono text-[11px] text-(--hint)", className)}>
      {truncated}
    </span>
  );
}
