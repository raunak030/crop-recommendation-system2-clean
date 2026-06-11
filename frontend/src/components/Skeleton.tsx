interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" className="rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height="0.75rem" />
          <Skeleton width="40%" height="0.625rem" />
        </div>
      </div>
      <Skeleton width="100%" height="0.625rem" />
      <Skeleton width="80%" height="0.625rem" />
    </div>
  );
}

export function SkeletonGauge() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <Skeleton width="160px" height="100px" className="rounded-xl" />
      <Skeleton width="80px" height="0.75rem" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton width="24px" height="24px" className="rounded-full" />
      <Skeleton width="30%" height="0.75rem" />
      <Skeleton width="20%" height="0.625rem" className="ml-auto" />
    </div>
  );
}