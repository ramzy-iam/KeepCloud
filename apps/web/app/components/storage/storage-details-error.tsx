import { Button } from '@keepcloud/web-core/react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StorageDetailsErrorProps {
  onRetry?: () => void;
}

export function StorageDetailsError({ onRetry }: StorageDetailsErrorProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Failed to Load Storage Data
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          We couldn't retrieve your storage information. Please check your
          connection and try again.
        </p>

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
