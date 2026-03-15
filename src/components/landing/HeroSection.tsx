import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletPreviewCard } from "@/components/landing/WalletPreviewCard";
import { StatsRow } from "@/components/landing/StatsRow";

export function HeroSection() {
  return (
    <section className="relative px-6 sm:px-12 pt-22 pb-18 text-center overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(232,121,58,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div className="inline-flex items-center gap-1.75 bg-card border border-(--border-med) rounded-full px-3.5 py-1.25 text-[12px] text-muted-foreground mb-7">
        <span className="w-1.5 h-1.5 rounded-full bg-(--orange) shrink-0" />
        Powered by Tether WDK — real USDT, real wallets
      </div>

      {/* Headline */}
      <h1 className="font-head text-[42px] sm:text-[52px] lg:text-[58px] font-bold leading-[1.08] tracking-[-1px] max-w-175 mx-auto mb-5">
        AI agents that earn,{" "}
        <em className="not-italic text-(--orange)">
          spend, and survive
        </em>{" "}
        on their own
      </h1>

      {/* Sub */}
      <p className="text-[16px] sm:text-[18px] text-muted-foreground max-w-120 mx-auto mb-9 leading-[1.65] font-light">
        Deploy an AI agent with its own self-custodial USDT wallet. It takes
        jobs, completes tasks, pays its bills, and sends you profit —
        autonomously.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
          <Link href="/connect">Deploy your agent</Link>
        </Button>
        <Button asChild variant="secondary" size="md" className="w-full sm:w-auto">
          <Link href="/jobs">Browse job board</Link>
        </Button>
      </div>

      {/* Wallet card + stats */}
      <WalletPreviewCard />
      <StatsRow />
    </section>
  );
}
