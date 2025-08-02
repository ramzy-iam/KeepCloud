import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  useGetStorageBreakdown,
} from '@keepcloud/web-core/react';
import { HardDrive, Files, Image, Video, Music, FileText } from 'lucide-react';
import { FileHelper } from '@keepcloud/commons/helpers';
import { StorageDetailsSkeleton } from './storage-details-skeleton';

interface StorageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedStorage: number;
  totalStorage: number;
}

export function StorageDetailsModal({
  isOpen,
  onClose,
  usedStorage,
  totalStorage,
}: StorageDetailsModalProps) {
  const { data: breakdownData } = useGetStorageBreakdown();
  const isLoading = true; // Simulating loading state for demonstration
  const usagePercentage = Math.round((usedStorage / totalStorage) * 100);
  const availableStorage = totalStorage - usedStorage;

  // Default breakdown if not provided or loading
  const breakdown = breakdownData ?? {
    images: {
      type: 'images',
      size: Math.round(usedStorage * 0.4),
      percentage: 40,
      count: 0,
    },
    videos: {
      type: 'videos',
      size: Math.round(usedStorage * 0.3),
      percentage: 30,
      count: 0,
    },
    documents: {
      type: 'documents',
      size: Math.round(usedStorage * 0.2),
      percentage: 20,
      count: 0,
    },
    audio: {
      type: 'audio',
      size: Math.round(usedStorage * 0.05),
      percentage: 5,
      count: 0,
    },
    other: {
      type: 'other',
      size: Math.round(usedStorage * 0.05),
      percentage: 5,
      count: 0,
    },
    totalFiles: 0,
    totalSize: usedStorage,
  };

  const storageItems = [
    {
      label: 'Images',
      value: breakdown.images.size,
      count: breakdown.images.count,
      percentage: breakdown.images.percentage,
      icon: Image,
      color: 'bg-blue-500',
    },
    {
      label: 'Videos',
      value: breakdown.videos.size,
      count: breakdown.videos.count,
      percentage: breakdown.videos.percentage,
      icon: Video,
      color: 'bg-red-500',
    },
    {
      label: 'Documents',
      value: breakdown.documents.size,
      count: breakdown.documents.count,
      percentage: breakdown.documents.percentage,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Audio',
      value: breakdown.audio.size,
      count: breakdown.audio.count,
      percentage: breakdown.audio.percentage,
      icon: Music,
      color: 'bg-yellow-500',
    },
    {
      label: 'Other',
      value: breakdown.other.size,
      count: breakdown.other.count,
      percentage: breakdown.other.percentage,
      icon: Files,
      color: 'bg-gray-500',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of your storage usage
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <StorageDetailsSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Overall Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Usage</span>
                <span className="text-sm text-muted-foreground">
                  {FileHelper.formatBytes(usedStorage)} of{' '}
                  {FileHelper.formatBytes(totalStorage)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#D9D9D9]">
                <div
                  className="h-full border-[#5749BF] bg-primary-gradient transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usagePercentage}% used</span>
                <span>
                  {FileHelper.formatBytes(availableStorage)} available
                </span>
              </div>
            </div>

            {/* Storage Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Storage Breakdown</h4>
              <div className="space-y-2">
                {storageItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.label}</span>
                        {item.count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({item.count} files)
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {FileHelper.formatBytes(item.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button variant="primary" className="flex-1">
                Manage Storage
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
