"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MainTopbar } from "@/components/layout/MainTopbar";
import { AgentsPanel } from "@/components/dashboard/AgentsPanel";
import { JobsPanel } from "@/components/dashboard/JobsPanel";
import { useUser } from "@/hooks/useUser";
import { useJobStore } from "@/store/jobStore";

type Tab = "agents" | "jobs";

export default function DashboardPage() {
  const { user, address, hydrated } = useUser();
  const { activeJobId, newlyDeliveredIds } = useJobStore();
  const hasJobActivity = !!activeJobId || newlyDeliveredIds.length > 0;
  const role = user?.role;
  const isOwner = role === "OWNER" || role === "BOTH";
  const isClient = role === "CLIENT" || role === "BOTH";
  const showBothTabs = role === "BOTH";

  const [tab, setTab] = useState<Tab>(role === "CLIENT" ? "jobs" : "agents");

  useEffect(() => {
    if (role === "CLIENT") setTab("jobs");
    else if (role === "OWNER" || role === "BOTH") setTab("agents");
  }, [role]);

  return (
    <>
      <MainTopbar
        title="Dashboard"
        subtitle={
          isOwner || isClient ? (
            <div className="flex gap-1.5 flex-wrap">
              {isOwner && (
                <Badge variant="orange" className="uppercase tracking-[.04em]">
                  Agent Owner
                </Badge>
              )}
              {isClient && (
                <Badge variant="green" className="uppercase tracking-[.04em]">
                  Client
                </Badge>
              )}
            </div>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2.5 max-sm:gap-2 flex-wrap">
            {isOwner && (
              <Button
                variant="secondary"
                size="default"
                className="text-[13px] px-3.5 py-2.25 max-sm:px-2.5 h-auto rounded-[8px] border-(--border-med) text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/withdraw">
                  <Download size={13} strokeWidth={1.4} />
                  <span className="max-sm:hidden">Withdraw all</span>
                </Link>
              </Button>
            )}

            {!isOwner && isClient && (
              <Button
                variant="secondary"
                size="default"
                className="text-[13px] px-3.5 py-2.25 max-sm:px-2.5 h-auto rounded-[8px] border-(--border-med) text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/jobs">
                  <Share2 size={13} strokeWidth={1.4} />
                  <span className="max-sm:hidden">Browse agents</span>
                </Link>
              </Button>
            )}

            {isOwner && (
              <Button
                size="default"
                className="bg-(--orange) text-white text-[13px] px-4 py-2.25 max-sm:px-3 h-auto rounded-[8px] hover:opacity-90"
                asChild
              >
                <Link href="/onboarding">
                  <Plus size={13} strokeWidth={1.5} />
                  <span className="max-sm:hidden">Deploy agent</span>
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <main className="w-full max-w-screen px-6.5 py-5.5 pb-20 max-[560px]:px-3.5 max-[560px]:py-3.5 flex-1">
        {showBothTabs ? (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="gap-0"
          >
            <TabsList className="bg-sidebar border border-border rounded-[9px] p-0.75 gap-0.5 h-auto mb-4.5 w-fit">
              <TabsTrigger
                value="agents"
                className="px-3.5 py-1.5 rounded-[7px] text-[13px] font-medium font-body data-active:bg-secondary data-active:text-foreground data-active:shadow-none"
              >
                My Agents
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="px-3.5 py-1.5 rounded-[7px] text-[13px] font-medium font-body data-active:bg-secondary data-active:text-foreground data-active:shadow-none"
              >
                My Jobs
                {hasJobActivity && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-(--orange) inline-block align-middle animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="agents">
              {user && isOwner && <AgentsPanel ownerId={user.id} />}
            </TabsContent>
            <TabsContent value="jobs">
              {user && isClient && <JobsPanel walletAddress={address ?? ""} />}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {user && isOwner && <AgentsPanel ownerId={user.id} />}
            {user && isClient && <JobsPanel walletAddress={address ?? ""} />}
          </>
        )}

        {!user && !hydrated && (
          <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-2.5 mb-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-22 rounded-[14px] bg-secondary animate-pulse"
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
