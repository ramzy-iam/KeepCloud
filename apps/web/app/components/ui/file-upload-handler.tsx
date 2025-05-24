import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useUploadFile } from '@keepcloud/web-core/react';

export interface FileUploadHandlerProps {
  maxFileSize: number;
  keysToInvalidate: string[][];
}

export interface FileUploadHandlerRef {
  triggerFileInput: () => void;
}

export interface FileUploadHandlerProps {
  maxFileSize: number;
  keysToInvalidate: string[][];
  uploadHandlerRef?: {
    triggerFileInput: () => void;
  };
}

export function FileUploadHandler({
  maxFileSize,
  keysToInvalidate,
  uploadHandlerRef,
}: FileUploadHandlerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [_, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadFile, isPending: isLoading } = useUploadFile({
    keysToInvalidate,
  });

  useEffect(() => {
    if (uploadHandlerRef) {
      uploadHandlerRef.triggerFileInput = () => {
        fileInputRef.current?.click();
      };
    }
  }, [uploadHandlerRef]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast.error(
        `File size exceeds limit of ${maxFileSize / FileHelper.convertToBytes(1, 'MB')} MB`,
      );
      fileInputRef.current!.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    uploadFile(
      { file },
      {
        onSuccess: () => {
          toast.success('File uploaded successfully');
          fileInputRef.current!.value = '';
          setSelectedFile(null);
        },
        onError: (error: any) => {
          const message = error.details?.[0]?.message || 'An error occurred';
          toast.error(`Upload failed: ${message}`);
          fileInputRef.current!.value = '';
          setSelectedFile(null);
        },
      },
    );
  };

  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      disabled={isLoading}
    />
  );
}
