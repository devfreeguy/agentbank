"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTag } from "@/components/shared/SectionTag";
import { faqItems } from "@/components/docs/data/docsFaqItems";

export function DocsFaq() {
  return (
    <section id="faq" className="py-14 sm:py-16 px-5 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionTag className="mb-2.5">FAQ</SectionTag>
        <h2 className="font-head text-[22px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Common questions
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 sm:mb-10 max-w-xl">
          Answers to the questions we hear most often.
        </p>

        <Accordion type="multiple" className="flex flex-col gap-2">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border rounded-[12px] px-4 sm:px-5 overflow-hidden data-[state=open]:border-(--border-med)"
            >
              <AccordionTrigger className="text-[13px] sm:text-[13.5px] font-medium text-foreground hover:no-underline py-3.5 sm:py-4 text-left leading-[1.45]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[12.5px] sm:text-[13px] text-muted-foreground leading-[1.7] font-light pb-4 pt-0">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
