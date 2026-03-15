import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full bg-card border border-[var(--border-med)] rounded-[10px] px-[14px] py-3",
        "text-[14px] text-foreground placeholder:text-[var(--hint)] placeholder:font-light",
        "focus:outline-none focus:border-[var(--orange)]",
        "transition-colors duration-150 resize-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
