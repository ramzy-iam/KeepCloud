import { useState } from 'react';
import { useUploadFile } from './file.hook';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export interface UploadEntry {
  file: File;
  uploadFile?: FileMinViewDto;
  progress: number;
  abortController: AbortController;
}

export const useUploadManager = (keysToInvalidate: string[][]) => {
  const [uploads, setUploads] = useState<UploadEntry[]>([]);

  const { mutate } = useUploadFile({
    keysToInvalidate,
    onProgress: (progress, updatedFile) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file.name === updatedFile.name ? { ...u, progress } : u,
        ),
      );
    },
  });

  const uploadFile = (file: File) => {
    const abortController = new AbortController();
    setUploads((prev) => [...prev, { file, progress: 0, abortController }]);

    mutate(
      { file, abortController },
      {
        onSuccess: (uploadedFile: FileMinViewDto) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file.name === file.name
                ? { ...u, uploadFile: uploadedFile, progress: 100 }
                : u,
            ),
          );
        },
        onError: () => {},
      },
    );
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

  return { uploads, uploadFile, cancelUpload, clearUploads };
};
