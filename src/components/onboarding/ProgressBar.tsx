import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { n: 1, label: "Choose role" },
  { n: 2, label: "Setup" },
  { n: 3, label: "Deploy" },
];

interface ProgressBarProps {
  step: 1 | 2 | 3;
}

export function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div className="relative z-10 flex justify-center items-center pt-7">
      <div className="flex items-center">
        {steps.map((s, i) => {
          const isDone = s.n < step;
          const isActive = s.n === step;

          return (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center font-head text-[11px] font-semibold transition-all duration-300",
                    isDone
                      ? "bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.22)] text-(--green)"
                      : isActive
                      ? "bg-(--orange-dim) border-(--orange) text-(--orange)"
                      : "bg-card border-border text-(--hint)"
                  )}
                >
                  {isDone ? (
                    <Check size={11} strokeWidth={2.5} />
                  ) : (
                    s.n
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] whitespace-nowrap transition-colors duration-300",
                    isDone
                      ? "text-muted-foreground"
                      : isActive
                      ? "text-foreground"
                      : "text-(--hint)"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-14 shrink-0 self-start mt-3.5 mb-4.5 transition-all duration-300",
                    s.n < step
                      ? "h-px bg-[rgba(34,197,94,0.22)]"
                      : "h-px bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
