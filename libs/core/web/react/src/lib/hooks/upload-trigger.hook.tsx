import { useRef, useCallback } from 'react';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useUploadManager } from './upload-manager.hook';
import { UploadTray } from '../components';
import { KeyToInvalidate } from '../services';

interface UseUploadTriggerOptions {
  maxFileSize?: number;
}

export function useUploadTrigger({
  maxFileSize = FileHelper.convertToBytes(10, 'MB'),
}: UseUploadTriggerOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploads, uploadFile, cancelUpload, clearUploads } =
    useUploadManager();

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size <= maxFileSize) {
        uploadFile(file);
      }
    });
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
      />
    </>
  );

  return { UploadHandler, triggerUpload };
}
