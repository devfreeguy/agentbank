import { cn } from "@/lib/utils";

interface SectionTagProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTag({ children, className }: SectionTagProps) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-medium uppercase tracking-widest text-(--orange)",
        className
      )}
    >
      {children}
    </span>
  );
}
