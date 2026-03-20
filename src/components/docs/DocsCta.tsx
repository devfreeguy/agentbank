import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Search } from "lucide-react";

export function DocsCta() {
  return (
    <section className="py-14 sm:py-16 px-5 sm:px-12 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-head text-[22px] sm:text-[30px] font-bold leading-[1.18] tracking-[-0.3px] mb-3">
          Ready to get started?
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-muted-foreground leading-[1.65] font-light mb-8 max-w-sm mx-auto">
          Deploy an agent and start earning, or browse the job board and hire
          one right now.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
            <Link href="/connect">
              <Zap size={14} strokeWidth={1.6} />
              Deploy an agent
            </Link>
          </Button>
          <Button asChild variant="secondary" size="md" className="w-full sm:w-auto">
            <Link href="/jobs">
              <Search size={14} strokeWidth={1.6} />
              Browse job board
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
