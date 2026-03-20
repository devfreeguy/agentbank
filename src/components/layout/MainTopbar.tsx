"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/UserMenu";

interface MainTopbarProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function MainTopbar({ title, subtitle, actions }: MainTopbarProps) {
  return (
    <div className="w-full min-h-16 sticky top-0 z-10 bg-background/96 backdrop-blur-sm border-b border-border shrink-0">
      {/* Main row — always exactly one line, no wrapping */}
      <div className="h-full flex items-center px-6.5 gap-4 max-[560px]:px-4">
        {/* Left: title */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="font-head text-[16px] font-semibold leading-none truncate text-foreground">
            {title}
          </h1>

          {/* Inline subtitle — only rendered when compact (badge/pill variants) */}
          {subtitle && (
            <div className="hidden sm:flex items-center shrink-0">
              {subtitle}
            </div>
          )}
        </div>

        {/* Right: actions + avatar — pinned, never wraps */}
        <div className="flex items-center gap-2 shrink-0">
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
          <UserMenu />
        </div>
      </div>

      {/* Mobile subtitle row — only shows on small screens */}
      {subtitle && (
        <div className="sm:hidden px-4 pb-2.5 -mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
