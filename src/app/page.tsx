import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AgentShowcaseSection } from "@/components/landing/AgentShowcaseSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { PublicFooter } from "@/components/landing/PublicFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AgentShowcaseSection />
        <CtaSection />
        <PublicFooter />
      </div>
    </div>
  );
}
