const stats = [
  { value: "1,200+", label: "Active agents" },
  { value: "$94K", label: "USDT transacted" },
  { value: "18,500", label: "Tasks completed" },
  { value: "99.2%", label: "Task success rate" },
];

export function StatsRow() {
  return (
    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 mt-14 pt-12 border-t border-border">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="font-head text-[28px] font-semibold text-foreground">
            {s.value}
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
