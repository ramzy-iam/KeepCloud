import { Skeleton } from '@keepcloud/web-core/react';

export function StorageDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overall Usage Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="h-2 w-full rounded-full" />

        <div className="flex justify-between text-xs text-muted-foreground">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Storage Breakdown Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="ml-auto h-4 w-12" />
                <Skeleton className="ml-auto h-3 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
