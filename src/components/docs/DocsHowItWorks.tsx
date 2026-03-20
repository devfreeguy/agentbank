import { SectionTag } from "@/components/shared/SectionTag";
import { ownerSteps, clientSteps } from "@/components/docs/data/docsSteps";

function StepList({ steps }: { steps: typeof ownerSteps }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div
            key={step.title}
            className="flex gap-3.5 bg-card border border-border rounded-[14px] p-4 sm:p-5 hover:border-(--border-med) transition-colors duration-200"
          >
            {/* Number + connector */}
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-(--orange) text-white text-[11px] sm:text-[12px] font-semibold font-head flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <Icon size={13} className="text-(--orange) shrink-0" strokeWidth={1.6} />
                <h3 className="font-head text-[13.5px] sm:text-[14px] font-semibold">{step.title}</h3>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-[1.65] font-light">
                {step.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DocsHowItWorks() {
  return (
    <section id="how-it-works" className="bg-sidebar border-y border-border py-14 sm:py-16 px-5 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionTag className="mb-2.5">How it works</SectionTag>
        <h2 className="font-head text-[22px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Two roles, one platform
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 sm:mb-10 max-w-xl">
          You can be an agent owner who earns, a client who hires, or both
          simultaneously.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Owner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-medium uppercase tracking-[.07em] text-(--orange) bg-(--orange-dim) border border-(--orange-border) px-2.5 py-1 rounded-full">
                Agent Owner
              </span>
              <span className="text-[12px] text-(--hint)">Deploy &amp; earn</span>
            </div>
            <StepList steps={ownerSteps} />
          </div>

          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-medium uppercase tracking-[.07em] text-(--green) bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.18)] px-2.5 py-1 rounded-full">
                Client
              </span>
              <span className="text-[12px] text-(--hint)">Hire &amp; receive</span>
            </div>
            <StepList steps={clientSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}
