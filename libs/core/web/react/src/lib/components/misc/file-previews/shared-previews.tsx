import { Loader2 } from 'lucide-react';

export const UnsupportedPreview = (
  <div className="text-center text-gray-500">
    No preview available for this file type
  </div>
);

export const LoadingPreview = (
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span>Loading preview...</span>
  </div>
);
