import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "wave";
}

export const Skeleton = ({ className, variant = "wave" }: SkeletonProps) => {
  return (
    <div
      className={cn(
        variant === "wave" ? "skeleton-wave" : "skeleton",
        className
      )}
    />
  );
};

// Common skeleton patterns
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("p-6 rounded-xl bg-card/80 border border-border/50", className)}>
    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === lines - 1 ? "w-4/5" : "w-full"
        )} 
      />
    ))}
  </div>
);

export const AvatarSkeleton = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };
  
  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
};

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="text-center">
        <Skeleton className="h-10 w-20 mx-auto mb-2" />
        <Skeleton className="h-4 w-16 mx-auto" />
      </div>
    ))}
  </div>
);

export const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => (
  <tr className="border-b border-border/50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton className="h-5 w-full" />
      </td>
    ))}
  </tr>
);