import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-bg-elevated", className)}
    />
  );
}

// Pre-built skeleton variants for common use cases
function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl bg-bg-secondary overflow-hidden", className)}>
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function SkeletonText({ lines = 3, className }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = "md", className }: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

function SkeletonTableRow({ columns = 4, className }: SkeletonProps & { columns?: number }) {
  return (
    <div className={cn("flex items-center gap-4 py-4 border-b border-border-subtle", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonTableRow };
