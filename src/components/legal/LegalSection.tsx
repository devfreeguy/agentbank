interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <div id={id} className="mb-10 sm:mb-12 scroll-mt-24">
      <h2 className="font-head text-[17px] sm:text-[19px] font-semibold text-foreground mb-4 pb-3 border-b border-border">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[13px] sm:text-[13.5px] text-muted-foreground leading-[1.75] font-light">
        {children}
      </div>
    </div>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-outside ml-5 flex flex-col gap-1.5">{children}</ul>
  );
}

export function LegalLi({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function LegalStrong({ children }: { children: React.ReactNode }) {
  return <strong className="text-foreground font-medium">{children}</strong>;
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[rgba(232,121,58,0.05)] border border-(--orange-border) rounded-[10px] px-4 py-3.5 text-[12.5px] text-muted-foreground leading-[1.65]">
      {children}
    </div>
  );
}
