import { useState } from 'react';
import { useUploadFile } from './file.hook';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { toast } from 'sonner';
import { ApiError } from '../services';

export interface UploadEntry {
  id: string;
  file: File;
  uploadFile?: FileMinViewDto;
  progress: number;
  abortController: AbortController;
  error?: string;
}

export const useUploadManager = () => {
  const [uploads, setUploads] = useState<UploadEntry[]>([]);

  const { mutateAsync } = useUploadFile({
    onProgress: (progress, updatedFile) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file.name === updatedFile.name ? { ...u, progress } : u,
        ),
      );
    },
  });

  const uploadFile = async (file: File) => {
    const abortController = new AbortController();
    setUploads((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file, progress: 0, abortController },
    ]);

    try {
      const uploadedFile = await mutateAsync({ file, abortController });
      setUploads((prev) =>
        prev.map((u) =>
          u.file.name === file.name
            ? { ...u, uploadFile: uploadedFile, progress: 100 }
            : u,
        ),
      );
    } catch (error) {
      const apiError = error as ApiError;
      let errorMessage = 'Upload failed';

      // Handle specific error types
      if (apiError) {
        if (
          apiError.details[0].message.includes('insufficient') ||
          apiError.details[0].message.includes('storage') ||
          apiError.details[0].message.includes('space') ||
          apiError.details[0].message.includes('quota')
        ) {
          errorMessage = 'Insufficient storage space';
          toast.error('Upload Failed', {
            description: `Not enough storage space to upload "${file.name}"`,
          });
        } else {
          errorMessage = apiError.details[0].message;
          toast.error('Upload Failed', {
            description: `Failed to upload "${file.name}": ${apiError.details[0].message}`,
          });
        }
      } else {
        toast.error('Upload Failed', {
          description: `Failed to upload "${file.name}"`,
        });
      }

      // Mark upload as failed
      setUploads((prev) =>
        prev.map((u) =>
          u.file.name === file.name
            ? { ...u, error: errorMessage, progress: 0 }
            : u,
        ),
      );
    }
  };

  const cancelUpload = (file: File) => {
    const entry = uploads.find((u) => u.file.name === file.name);
    if (entry) {
      entry.abortController.abort();
      setUploads((prev) => prev.filter((u) => u.file.name !== file.name));
    }
  };

  const clearUploads = () => {
    setUploads([]);
  };

  const retryUpload = (file: File) => {
    // Remove the failed upload entry
    setUploads((prev) => prev.filter((u) => u.file.name !== file.name));
    // Retry the upload
    uploadFile(file);
  };

  return { uploads, uploadFile, cancelUpload, clearUploads, retryUpload };
};
