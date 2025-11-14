import { useRef, useCallback } from 'react';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useUploadManager } from './upload-manager.hook';
import { useGetUserStorage } from './storage.hook';
import { UploadTray } from '../components';
import { toast } from 'sonner';

interface UseUploadTriggerOptions {
  maxFileSize?: number;
}

export function useUploadTrigger({
  maxFileSize,
}: UseUploadTriggerOptions = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploads, uploadFile, cancelUpload, clearUploads, retryUpload } =
    useUploadManager();
  const { data: storageInfo } = useGetUserStorage();

  // Calculate effective max file size based on remaining storage
  const effectiveMaxFileSize =
    maxFileSize ??
    (storageInfo
      ? storageInfo.totalStorage - storageInfo.usedStorage
      : FileHelper.convertToBytes(10, 'MB')); // Fallback to 10MB if no storage info

  const checkStorageSpace = useCallback(
    (files: File[]): { canUpload: boolean; rejectedFiles: File[] } => {
      if (!storageInfo) {
        // If we don't have storage info, allow upload and let backend handle it
        return { canUpload: true, rejectedFiles: [] };
      }

      const totalFilesSize = files.reduce(
        (total, file) => total + file.size,
        0,
      );
      const availableSpace = storageInfo.totalStorage - storageInfo.usedStorage;
      const rejectedFiles: File[] = [];

      if (totalFilesSize > availableSpace) {
        // Calculate which files can fit
        let runningSize = 0;
        const acceptedFiles: File[] = [];

        for (const file of files) {
          if (runningSize + file.size <= availableSpace) {
            acceptedFiles.push(file);
            runningSize += file.size;
          } else {
            rejectedFiles.push(file);
          }
        }

        if (rejectedFiles.length > 0) {
          const rejectedSizeFormatted = FileHelper.formatBytes(
            rejectedFiles.reduce((total, file) => total + file.size, 0),
          );
          const availableSpaceFormatted =
            FileHelper.formatBytes(availableSpace);

          toast.error('Insufficient Storage Space', {
            description: `Cannot upload ${rejectedFiles.length} file(s) (${rejectedSizeFormatted}). Available space: ${availableSpaceFormatted}`,
          });
        }

        return { canUpload: acceptedFiles.length > 0, rejectedFiles };
      }

      return { canUpload: true, rejectedFiles: [] };
    },
    [storageInfo],
  );

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter files by size first
    const validSizeFiles = files.filter((file) => {
      if (file.size > effectiveMaxFileSize) {
        toast.error(`File too large: ${file.name}`, {
          description: `Maximum file size is ${FileHelper.formatBytes(effectiveMaxFileSize)}`,
        });
        return false;
      }
      return true;
    });

    // Check storage space for valid files
    const { canUpload, rejectedFiles } = checkStorageSpace(validSizeFiles);

    if (canUpload) {
      // Upload files that passed validation
      const filesToUpload = validSizeFiles.filter(
        (file) => !rejectedFiles.includes(file),
      );

      filesToUpload.forEach((file) => {
        uploadFile(file);
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const UploadHandler = () => (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        multiple
      />
      <UploadTray
        uploads={uploads}
        onCancel={cancelUpload}
        onClear={clearUploads}
        onRetry={retryUpload}
      />
    </>
  );

  return { UploadHandler, triggerUpload };
}
