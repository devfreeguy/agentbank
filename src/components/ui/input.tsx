import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full bg-card border border-[var(--border-med)] rounded-[10px] px-[14px] py-3",
        "text-[14px] text-foreground placeholder:text-[var(--hint)] placeholder:font-light",
        "focus:outline-none focus:border-[var(--orange)]",
        "transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        type === "number" && "font-mono",
        className
      )}
      {...props}
    />
  )
}

export { Input }
