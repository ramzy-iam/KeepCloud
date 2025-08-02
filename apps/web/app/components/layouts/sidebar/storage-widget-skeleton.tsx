import { cn, Skeleton } from '@keepcloud/web-core/react';

interface StorageWidgetSkeletonProps {
  className?: string;
}

export function StorageWidgetSkeleton({
  className = '',
}: StorageWidgetSkeletonProps) {
  return (
    <div
      className={cn(
        'relative flex h-[140px] min-h-[140px] w-[219px] flex-col gap-3 overflow-hidden rounded-[8px] p-4 shadow-[0_2px_12px_0_rgba(0,0,0,0.12)] dark:border-[#1E1E23] dark:bg-[#1E1E23] dark:shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]',
        className,
      )}
    >
      <div className="flex items-center justify-between text-14-medium text-heading">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
      </div>

      <div className="flex flex-col gap-2">
        {/* Progress Bar */}
        <Skeleton className="h-[8px] w-full rounded-[20px]" />

        {/* Storage Details */}
        <div className="flex flex-wrap items-center justify-between text-12-medium text-neutral-500 dark:text-white-light">
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Upgrade Button */}
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
}
