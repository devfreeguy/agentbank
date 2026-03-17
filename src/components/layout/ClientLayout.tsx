"use client";

import { AppLoader } from "@/components/layout/AppLoader";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppLoader>{children}</AppLoader>;
}
