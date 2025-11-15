import React, { createContext, useContext, ReactNode } from 'react';
import { useUploadTrigger } from '@keepcloud/web-core/react';
import { FileHelper } from '@keepcloud/commons/helpers';

interface UploadContextType {
  triggerUpload: () => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

interface UploadProviderProps {
  children: ReactNode;
  maxFileSize?: number;
}

export const UploadProvider = ({
  children,
  maxFileSize,
}: UploadProviderProps) => {
  const { UploadHandler, triggerUpload } = useUploadTrigger({
    maxFileSize,
  });

  return (
    <UploadContext.Provider value={{ triggerUpload }}>
      {children}
      <UploadHandler />
    </UploadContext.Provider>
  );
};

export const useGlobalUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useGlobalUpload must be used within an UploadProvider');
  }
  return context;
};
