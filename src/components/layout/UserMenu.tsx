"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { formatAddress } from "@/utils/format";
import { useUser } from "@/hooks/useUser";

export function UserMenu() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { clearUser, address } = useUser();

  function handleDisconnect() {
    disconnect();
    clearUser();
    router.push("/");
  }

  function copyAddress() {
    if (address) navigator.clipboard.writeText(address);
  }

  const avatarLabel = address ? address.slice(2, 4).toUpperCase() : "?";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-8.5 h-8.5 rounded-full bg-(--bg3) border border-(--border-med) flex items-center justify-center font-mono text-[11px] text-muted-foreground cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors shrink-0">
          {avatarLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-1.5 bg-sidebar border border-(--border-med) rounded-[12px] shadow-lg"
      >
        {/* Wallet row */}
        <div className="px-3 py-2.5 mb-0.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                <div className="w-1.25 h-1.25 rounded-full bg-(--green)" />
                Connected
              </div>
              <div className="font-mono text-[11px] text-foreground">
                {address ? formatAddress(address) : "—"}
              </div>
            </div>
            <button
              onClick={copyAddress}
              className="p-1.5 rounded-[6px] text-(--hint) hover:text-foreground hover:bg-card transition-colors cursor-pointer"
            >
              <Copy size={12} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="h-px bg-border mx-1 mb-1" />

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] text-muted-foreground hover:text-foreground hover:bg-card transition-colors no-underline"
        >
          <LayoutDashboard size={14} strokeWidth={1.4} />
          Dashboard
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] text-muted-foreground hover:text-foreground hover:bg-card transition-colors no-underline"
        >
          <Settings size={14} strokeWidth={1.4} />
          Settings
        </Link>

        <div className="h-px bg-border mx-1 my-1" />

        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] text-(--hint) hover:text-red-500 hover:bg-[rgba(239,68,68,0.06)] transition-colors cursor-pointer"
        >
          <LogOut size={14} strokeWidth={1.4} />
          Disconnect
        </button>
      </PopoverContent>
    </Popover>
  );
}
