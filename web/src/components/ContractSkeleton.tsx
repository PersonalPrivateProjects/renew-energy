"use client";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`}></div>;
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <SkeletonLine className="h-4 w-2/5" />
      <SkeletonLine className="h-8 w-3/5" />
      <SkeletonLine className="h-3 w-full" />
    </div>
  );
}
