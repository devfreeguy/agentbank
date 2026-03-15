"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/shared/LogoMark";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Job board", href: "/jobs" },
  { label: "Docs", href: "/docs" },
];

export function Navbar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md",
        "border-b border-border",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-head text-[17px] font-semibold text-foreground">
            AgentBank
          </span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/connect"
            className="hidden md:block bg-(--orange) text-foreground text-[13px] font-medium rounded-[8px] px-5 py-2.25 hover:opacity-90 transition-opacity duration-150"
          >
            Connect Wallet
          </Link>
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/connect"
            onClick={() => setOpen(false)}
            className="mt-2 w-full block text-center bg-(--orange) text-foreground text-[13px] font-medium rounded-[8px] px-5 py-2.25 hover:opacity-90 transition-opacity duration-150"
          >
            Connect Wallet
          </Link>
        </div>
      )}
    </nav>
  );
}
