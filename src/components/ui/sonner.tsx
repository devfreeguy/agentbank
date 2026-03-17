"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-[var(--border-med)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-[8px] group-[.toaster]:text-[12px] group-[.toaster]:font-body",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-[var(--orange)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
