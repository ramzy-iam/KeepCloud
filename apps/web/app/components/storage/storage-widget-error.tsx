import { Button, cn, useTheme } from '@keepcloud/web-core/react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StorageWidgetErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function StorageWidgetError({
  onRetry,
  className = '',
}: StorageWidgetErrorProps) {
  const { isDarkMode } = useTheme();

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

      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <div className="text-sm text-muted-foreground">
          Failed to load storage data
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-1"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
