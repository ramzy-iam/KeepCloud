import { Button, cn, useTheme } from '@keepcloud/web-core/react';
import { FileHelper } from '@keepcloud/commons/helpers';
import { StorageWidgetSkeleton } from './storage-widget-skeleton';
import { StorageWidgetError } from './storage-widget-error';

interface StorageWidgetProps {
  usedStorage: number;
  totalStorage: number;
  onUpgrade?: () => void;
  onSeeDetails?: () => void;
  className?: string;
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function StorageWidget({
  usedStorage,
  totalStorage,
  onUpgrade,
  onSeeDetails,
  className = '',
  isLoading = false,
  error = false,
  onRetry,
}: StorageWidgetProps) {
  const { isDarkMode } = useTheme();

  if (error) {
    return <StorageWidgetError onRetry={onRetry} className={className} />;
  }

  if (isLoading) {
    return <StorageWidgetSkeleton className={className} />;
  }

  const usagePercentage = Math.round((usedStorage / totalStorage) * 100);
  const { used, total } = FileHelper.formatStorageConsistent(
    usedStorage,
    totalStorage,
    usedStorage >= FileHelper.convertToBytes(10, 'MB') ? 0 : 1,
  );

  return (
    <div
      className={cn(
        'relative flex h-[140px] min-h-[140px] w-[219px] flex-col gap-3 overflow-hidden rounded-[8px] border border-[#F2F2F3] p-4 shadow-[0_2px_12px_0_rgba(0,0,0,0.12)] dark:border-0 dark:border-transparent dark:bg-[#1E1E23] dark:shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]',
        className,
      )}
    >
      {isDarkMode && (
        <>
          <div className="stroke-gradient absolute inset-0 h-full w-full"></div>
          <div
            className="absolute top-0 left-0 h-[1px] w-[217px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
            style={{
              background:
                'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
            }}
          ></div>

          {/* Blurred inner divider */}
          <div
            className="absolute top-0 left-[56.91px] h-[1px] w-[153.18px] blur-[2px]"
            style={{
              background:
                'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
            }}
          ></div>
          <div className="absolute top-[-15px] left-1/2 z-0 h-[23px] w-[107px] -translate-x-1/2 bg-white blur-[50px]"></div>
        </>
      )}
      <div className="flex items-center justify-between text-14-medium text-heading">
        <span>Available Storage</span>
        <span className="text-14-semibold">{usagePercentage}%</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="h-[8px] overflow-hidden rounded-full bg-[#D9D9D9]">
          <div
            className="h-full border-[#5749BF] bg-primary-gradient-right transition-all duration-300"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        {/* Storage Details */}
        <div className="flex flex-wrap items-center justify-between text-12-medium text-neutral-500 dark:text-white-light">
          <span>
            {used} used{' '}
            <span className="text-12 text-neutral-400 dark:text-neutral-200">
              of {total}
            </span>
          </span>
          {onSeeDetails && (
            <button
              onClick={onSeeDetails}
              className="hover:text-primary-600 cursor-pointer text-12 text-heading transition-colors"
            >
              Details
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Button */}
      <Button
        variant={isDarkMode ? 'primary' : 'primaryDark'}
        onClick={onUpgrade}
        className="w-full"
      >
        <span className="flex items-center gap-2">
          <svg
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.16723 1.33301L3.22953 8.45824C2.99699 8.73729 2.88072 8.87681 2.87894 8.99465C2.8774 9.09709 2.92305 9.19454 3.00273 9.25894C3.09439 9.33301 3.27601 9.33301 3.63925 9.33301H8.50056L7.83389 14.6663L13.7716 7.54111C14.0041 7.26206 14.1204 7.12254 14.1222 7.0047C14.1237 6.90226 14.0781 6.8048 13.9984 6.74041C13.9067 6.66634 13.7251 6.66634 13.3619 6.66634H8.50056L9.16723 1.33301Z"
              fill="white"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-14-medium">Upgrade</span>
        </span>
      </Button>
    </div>
  );
}
