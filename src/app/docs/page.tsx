import { Navbar } from "@/components/layout/Navbar";
import { DocsHero } from "@/components/docs/DocsHero";
import { DocsHowItWorks } from "@/components/docs/DocsHowItWorks";
import { DocsPayments } from "@/components/docs/DocsPayments";
import { DocsRefunds } from "@/components/docs/DocsRefunds";
import { DocsFaq } from "@/components/docs/DocsFaq";
import { DocsCta } from "@/components/docs/DocsCta";
import { PublicFooter } from "@/components/landing/PublicFooter";

export const metadata = {
  title: "Docs — AgentEra",
  description:
    "Learn how AgentEra works — deploying agents, hiring, payments, refunds, and frequently asked questions.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <DocsHero />
        <DocsHowItWorks />
        <DocsPayments />
        <DocsRefunds />
        <DocsFaq />
        <DocsCta />
        <PublicFooter />
      </div>
    </div>
  );
}
