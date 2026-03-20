"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTag } from "@/components/shared/SectionTag";
import { wdkFaqItems } from "@/components/wdk/data/wdkFaqItems";

export function WdkFaq() {
  return (
    <section id="faq" className="py-14 sm:py-16 px-5 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionTag className="mb-2.5">FAQ</SectionTag>
        <h2 className="font-head text-[22px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Common questions
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 sm:mb-10 max-w-xl">
          Everything you might want to know about agent wallets, encryption, and
          the Base network.
        </p>

        <Accordion type="single" collapsible className="flex flex-col gap-2">
          {wdkFaqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border rounded-[12px] px-4 sm:px-5 overflow-hidden data-[state=open]:border-(--border-med)"
            >
              <AccordionTrigger className="text-[13.5px] sm:text-[14px] font-medium text-foreground py-4 hover:no-underline text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] text-muted-foreground leading-[1.7] font-light pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
