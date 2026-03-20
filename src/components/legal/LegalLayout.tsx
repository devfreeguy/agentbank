import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/landing/PublicFooter";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative px-5 sm:px-12 pt-16 sm:pt-20 pb-10 border-b border-border">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] sm:w-120 h-48 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(232,121,58,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-[11px] font-medium uppercase tracking-widest text-(--orange) mb-3">
              Legal
            </div>
            <h1 className="font-head text-[28px] sm:text-[40px] font-bold leading-[1.1] tracking-[-0.4px] mb-3">
              {title}
            </h1>
            <p className="text-[13.5px] sm:text-[14px] text-muted-foreground font-light">
              {subtitle}
            </p>
            <div className="mt-4 text-[12px] text-(--hint)">
              Last updated: {lastUpdated}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-5 sm:px-12 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose-legal">{children}</div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
