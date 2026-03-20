export function PageLoadingSkeleton() {
  return (
    <>
      {/* Topbar skeleton */}
      <div className="w-full h-[57px] border-b border-border shrink-0 flex items-center px-6.5 gap-4 max-[560px]:px-4">
        <div className="h-4 w-32 rounded-[6px] bg-secondary animate-pulse" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-20 rounded-[8px] bg-secondary animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 px-6.5 py-7 max-[560px]:px-3.5 max-[560px]:py-4 flex flex-col gap-3">
        <div className="h-3 w-48 rounded bg-secondary animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-22 rounded-[14px] bg-secondary animate-pulse" />
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-[12px] bg-secondary animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      </div>
    </>
  );
}
