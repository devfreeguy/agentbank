"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useUser } from "@/hooks/useUser";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, isConnected, isHydrated } = useUser(); // isHydrated kept for redirect guard
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isConnected) router.replace("/connect");
  }, [isHydrated, isConnected, router]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar walletAddress={address ?? ""} />
      <div className="min-[900px]:ml-60 flex-1 min-w-0 flex flex-col min-h-screen pb-16 md:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
