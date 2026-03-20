"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { HireFlow, type HireStep } from "@/components/jobs/HireFlow";
import { cn } from "@/lib/utils";
import type { AgentPublic, JobWithRelations, WalletUser } from "@/types/index";

interface AgentSlideOverProps {
  agent: AgentPublic | null;
  open: boolean;
  onClose: () => void;
  user: WalletUser | null;
  onJobAdded: (job: JobWithRelations) => void;
  showToast: (msg: string) => void;
  initialStep?: HireStep;
  initialJobId?: string;
  initialTaskDescription?: string;
}

const STEPS: HireStep[] = ["detail", "describe", "review", "waiting", "running", "delivered"];

const STEP_LABELS: Record<HireStep, string> = {
  detail: "Agent detail",
  describe: "Describe task",
  review: "Review & pay",
  waiting: "Processing",
  running: "In progress",
  delivered: "Delivered",
};

const STEP_DOT_INDEX: Record<HireStep, number> = {
  detail: 1,
  describe: 2,
  review: 3,
  waiting: 4,
  running: 5,
  delivered: 5,
};

const TOTAL_DOTS = 5;

export function AgentSlideOver({
  agent,
  open,
  onClose,
  user,
  onJobAdded,
  showToast,
  initialStep,
  initialJobId,
  initialTaskDescription,
}: AgentSlideOverProps) {
  const [step, setStep] = useState<HireStep>(initialStep || "detail");

  useEffect(() => {
    setStep(initialStep || "detail");
  }, [agent?.id, initialStep]);

  useEffect(() => {
    if (!open && step !== "running" && step !== "waiting") {
      const t = setTimeout(() => setStep("detail"), 300);
      return () => clearTimeout(t);
    }
  }, [open, step]);

  const activeDot = STEP_DOT_INDEX[step];

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="flex flex-col z-101 p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
                const dotNum = i + 1;
                const isDone = dotNum < activeDot;
                const isActive = dotNum === activeDot;
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-[3px] rounded-full transition-all duration-300",
                      isDone ? "w-4 bg-[rgba(34,197,94,0.4)]" : isActive ? "w-5 bg-(--orange)" : "w-4 bg-[rgba(255,255,255,0.1)]"
                    )}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-(--hint)">
              {STEP_LABELS[step]}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[7px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-colors"
          >
            <X size={13} strokeWidth={1.6} className="text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        {agent && (
          <HireFlow
            agent={agent}
            user={user}
            step={step}
            onStepChange={setStep}
            onClose={onClose}
            onJobAdded={onJobAdded}
            showToast={showToast}
            initialJobId={initialJobId}
            initialTaskDescription={initialTaskDescription}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
