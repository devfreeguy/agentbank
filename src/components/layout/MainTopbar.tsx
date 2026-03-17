"use client";

import * as React from "react";
import { formatAddress } from "@/utils/format";
import { useUser } from "@/hooks/useUser";
import { UserMenu } from "@/components/layout/UserMenu";

interface MainTopbarProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function MainTopbar({ title, subtitle, actions }: MainTopbarProps) {
  const { address } = useUser();

  return (
    <div className="w-full max-w-screen flex items-center justify-between px-6.5 py-4 border-b border-border sticky top-0 z-10 bg-background flex-wrap gap-2.5">
      <div className="flex flex-col gap-1">
        <h1 className="font-head text-[20px] font-bold">{title}</h1>
        {subtitle && <div>{subtitle}</div>}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Address pill — hidden below 900px */}
        <div className="hidden min-[900px]:flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-card border border-(--border-med) px-3 py-1.5 rounded-full">
          <div className="w-1.25 h-1.25 rounded-full bg-(--green)" />
          {address ? formatAddress(address) : "—"}
        </div>

        {actions}

        <UserMenu />
      </div>
    </div>
  );
}
