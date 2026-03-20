import { SectionTag } from "@/components/shared/SectionTag";
import { wdkCapabilities } from "@/components/wdk/data/wdkCapabilities";

export function WdkCapabilities() {
  return (
    <section id="capabilities" className="py-14 sm:py-16 px-5 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionTag className="mb-2.5">Capabilities</SectionTag>
        <h2 className="font-head text-[22px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          What the WDK service does
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 sm:mb-10 max-w-xl">
          Five internal endpoints cover the full wallet lifecycle — from creation
          through payment and withdrawal.
        </p>

        <div className="flex flex-col gap-3">
          {wdkCapabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="bg-card border border-border rounded-[14px] p-4 sm:p-5 flex gap-4 hover:border-(--border-med) transition-colors duration-200"
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div className="w-7 h-7 rounded-full bg-(--orange) text-white text-[11px] font-semibold font-head flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  {i < wdkCapabilities.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Icon
                      size={13}
                      className="text-(--orange) shrink-0"
                      strokeWidth={1.6}
                    />
                    <h3 className="font-head text-[13.5px] sm:text-[14px] font-semibold">
                      {cap.title}
                    </h3>
                    {cap.badge && (
                      <span className="ml-auto shrink-0 text-[10px] font-mono text-(--hint) bg-background border border-border px-2 py-0.5 rounded-[5px]">
                        {cap.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-[1.65] font-light">
                    {cap.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
