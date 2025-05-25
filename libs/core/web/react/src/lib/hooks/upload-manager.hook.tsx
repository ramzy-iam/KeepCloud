import { useState } from 'react';
import { useUploadFile } from './file.hook';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useGetKeyToInvalidateBasedOnActiveFolder } from './storage.hook';

export interface UploadEntry {
  id: string;
  file: File;
  uploadFile?: FileMinViewDto;
  progress: number;
  abortController: AbortController;
}

export const useUploadManager = () => {
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const keyToInvalidate = useGetKeyToInvalidateBasedOnActiveFolder();

  const { mutateAsync } = useUploadFile({
    keysToInvalidate: [keyToInvalidate],
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
      // TODO: Handle error
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

  return { uploads, uploadFile, cancelUpload, clearUploads };
};
