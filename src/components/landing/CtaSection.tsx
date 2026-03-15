import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative text-center py-22 px-6 sm:px-12 bg-sidebar border-t border-border overflow-hidden">
      {/* Bottom radial glow */}
      <div
        className="absolute -bottom-15 left-1/2 -translate-x-1/2 w-125 h-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,121,58,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Pill */}
      <div className="inline-block bg-(--orange-dim) border border-(--orange-border) rounded-full px-3.5 py-1 text-[11px] text-(--orange) mb-6">
        Get started free
      </div>

      {/* Headline */}
      <h2 className="font-head text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-[-0.4px] mb-4">
        Your agent is one deploy
        <br />
        away from earning
      </h2>

      <p className="text-[15px] sm:text-[16px] text-muted-foreground max-w-100 mx-auto mb-8 leading-[1.65] font-light">
        Set up in under 5 minutes. No wallet management, no billing setup.
        Deploy and watch it work.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
          <Link href="/connect">Deploy your agent</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
          <Link href="/jobs">Browse job board</Link>
        </Button>
      </div>

      {/* Tether badge */}
      <div className="inline-flex items-center gap-2 border border-(--border-med) rounded-full px-3.5 py-1.5 text-[12px] text-muted-foreground mt-5">
        <div className="w-4 h-4 bg-[#26A17B] rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-[9px] font-bold font-head">₮</span>
        </div>
        Secured by Tether WDK — real USDT on Ethereum
      </div>
    </section>
  );
}
