import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from '@keepcloud/web-core/react';
import { HardDrive, Files, Image, Video, Music, FileText } from 'lucide-react';
import { FileHelper } from '@keepcloud/commons/helpers';

interface StorageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedStorage: number;
  totalStorage: number;
  storageBreakdown?: {
    images: number;
    videos: number;
    documents: number;
    audio: number;
    other: number;
  };
}

export function StorageDetailsModal({
  isOpen,
  onClose,
  usedStorage,
  totalStorage,
  storageBreakdown,
}: StorageDetailsModalProps) {
  const usagePercentage = Math.round((usedStorage / totalStorage) * 100);
  const availableStorage = totalStorage - usedStorage;

  // Default breakdown if not provided
  const breakdown = storageBreakdown ?? {
    images: usedStorage * 0.4,
    videos: usedStorage * 0.3,
    documents: usedStorage * 0.2,
    audio: usedStorage * 0.05,
    other: usedStorage * 0.05,
  };

  const storageItems = [
    {
      label: 'Images',
      value: breakdown.images,
      icon: Image,
      color: 'bg-blue-500',
    },
    {
      label: 'Videos',
      value: breakdown.videos,
      icon: Video,
      color: 'bg-red-500',
    },
    {
      label: 'Documents',
      value: breakdown.documents,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Audio',
      value: breakdown.audio,
      icon: Music,
      color: 'bg-yellow-500',
    },
    {
      label: 'Other',
      value: breakdown.other,
      icon: Files,
      color: 'bg-gray-500',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of your storage usage
          </DialogDescription>
        </DialogHeader>

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

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usagePercentage}% used</span>
              <span>{FileHelper.formatBytes(availableStorage)} available</span>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Storage Breakdown</h4>
            <div className="space-y-2">
              {storageItems.map((item) => {
                const percentage = Math.round((item.value / usedStorage) * 100);
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
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {FileHelper.formatBytes(item.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage}%
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
      </DialogContent>
    </Dialog>
  );
}
