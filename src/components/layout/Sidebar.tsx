"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/lib/sidebarItems";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col">
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors duration-150",
                active
                  ? "bg-(--orange-dim) text-(--orange)"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              <Icon
                size={15}
                className={cn(
                  "shrink-0",
                  active ? "text-(--orange)" : "text-(--hint)"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
