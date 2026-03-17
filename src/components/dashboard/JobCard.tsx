"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { JobWithRelations } from "@/types/index";
import type { JobStatus } from "@/generated/prisma/enums";

interface JobCardProps {
  job: JobWithRelations;
  isNew?: boolean;
  onViewed?: () => void;
}

const STATUS_STYLES: Record<JobStatus, string> = {
  PENDING_PAYMENT:
    "bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-[#3b82f6]",
  PAID: "bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--orange)]",
  IN_PROGRESS:
    "bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.18)] text-[#fbbf24]",
  DELIVERED:
    "bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[var(--green)]",
  FAILED:
    "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.18)] text-[#ef4444]",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

export function JobCard({ job, isNew, onViewed }: JobCardProps) {
  const router = useRouter();
  const [outputOpen, setOutputOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const status = job.status as JobStatus;

  function handleViewOutput() {
    onViewed?.();
    setOutputOpen(true);
  }

  return (
    <>
      <div
        className={cn(
          "bg-sidebar border border-(--border-med) rounded-[12px] px-4 py-3.5 flex items-center gap-3 transition-colors hover:border-[rgba(255,255,255,0.17)]",
          status === "FAILED" && "opacity-70",
        )}
      >
        {/* Avatar */}
        <div className="relative w-8.5 h-8.5 shrink-0">
          <div className="w-full h-full rounded-[8px] bg-[rgba(99,102,241,0.12)] flex items-center justify-center text-[16px]">
            🤖
          </div>
          {status === "IN_PROGRESS" && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-(--orange) animate-pulse border-2 border-background" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-muted-foreground mb-0.75">
            {job.agent.name}
          </div>
          <div className="text-[13px] text-foreground truncate whitespace-break-spaces line-clamp-2">
            {job.taskDescription}
          </div>
          <div className="flex items-center gap-2 mt-1.25">
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full tracking-[.04em]",
                STATUS_STYLES[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
            {isNew && status === "DELIVERED" && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full tracking-[.04em] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] text-(--green)">
                New
              </span>
            )}
            <span className="text-[11px] text-(--hint)">
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={cn(
              "font-mono text-[13px] font-medium",
              status === "FAILED" && "text-(--hint)",
            )}
          >
            {parseFloat(job.priceUsdt).toFixed(2)} USDT
          </span>

          {status === "DELIVERED" && (
            <button
              onClick={handleViewOutput}
              className="px-2.75 py-1.25 bg-(--orange-dim) border border-(--orange-border) rounded-[6px] text-[11px] text-(--orange) hover:bg-[rgba(232,121,58,0.18)] transition-colors cursor-pointer"
            >
              View output
            </button>
          )}
          {status === "PENDING_PAYMENT" && (
            <button
              onClick={() => setPayOpen(true)}
              className="px-2.75 py-1.25 bg-(--orange-dim) border border-(--orange-border) rounded-[6px] text-[11px] text-(--orange) hover:bg-[rgba(232,121,58,0.18)] transition-colors cursor-pointer"
            >
              Pay now
            </button>
          )}
          {status === "FAILED" && (
            <button
              onClick={() => router.push("/jobs")}
              className="px-2.75 py-1.25 bg-card border border-(--border-med) rounded-[6px] text-[11px] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.17)] transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
          {(status === "IN_PROGRESS" || status === "PAID") && (
            <button className="px-2.75 py-1.25 bg-card border border-(--border-med) rounded-[6px] text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              View task
            </button>
          )}
        </div>
      </div>

      {/* Output dialog */}
      <Dialog open={outputOpen} onOpenChange={setOutputOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Job output</DialogTitle>
            <DialogDescription><p className="line-clamp-2">{job.taskDescription}</p></DialogDescription>
          </DialogHeader>
          <div className="bg-card border border-border rounded-[10px] p-4 text-[13px] text-foreground leading-[1.7] max-h-90 overflow-y-auto whitespace-pre-wrap font-mono">
            {job.output ?? "No output recorded."}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay now dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay agent</DialogTitle>
            <DialogDescription>
              Send exactly{" "}
              <strong>{parseFloat(job.priceUsdt).toFixed(2)} USDT</strong> to
              the agent wallet to start your job.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-card border border-border rounded-[10px] p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-[.06em] mb-2">
              Agent wallet address
            </div>
            <div className="font-mono text-[13px] text-foreground break-all">
              {job.agent.walletAddress}
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(job.agent.walletAddress)
              }
              className="mt-2 text-[11px] text-(--orange) hover:underline cursor-pointer"
            >
              Copy address
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
