"use client";

import { MainTopbar } from "@/components/layout/MainTopbar";
import { WithdrawPanel } from "@/components/withdraw/WithdrawPanel";

export default function WithdrawPage() {
  return (
    <>
      <MainTopbar title="Withdraw Funds" />
      <main className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--bg4)_transparent]">
        <WithdrawPanel />
      </main>
    </>
  );
}
