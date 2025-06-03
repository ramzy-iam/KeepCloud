import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGeneratePresignedGet } from './file.hook';

interface UseFilePreviewerProps {
  file?: FileMinViewDto;
}

const supportedFormats = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];

const ImagePreview = ({ url, file }: { url: string; file: FileMinViewDto }) => (
  <img
    src={url}
    alt={file.name}
    className="max-h-[70vh] max-w-full object-contain"
    onError={() => toast.error('Failed to load image preview')}
  />
);

const PDFPreview = ({ url }: { url: string }) => {
  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  return (
    <iframe
      src={googleViewerUrl}
      title="PDF Preview"
      className="h-[70vh] w-full rounded border"
      allow="fullscreen"
      onError={() => toast.error('Failed to load PDF preview')}
    />
  );
};

const UnsupportedPreview = (
  <div className="text-center text-gray-500">
    No preview available for this file type
  </div>
);

const LoadingPreview = (
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span>Loading preview...</span>
  </div>
);

export const useFilePreviewer = ({ file }: UseFilePreviewerProps) => {
  const isPreviewable = useMemo(() => {
    return Boolean(
      file?.format && supportedFormats.includes(file.format.toLowerCase()),
    );
  }, [file?.format]);

  const {
    isLoading,
    error,
    data: presignedUrl,
  } = useGeneratePresignedGet({
    fileId: file?.id,
    enabled: isPreviewable,
  });

  const ErrorPreview = useMemo(
    () => (
      <div className="text-center text-red-500">
        Failed to load preview:{' '}
        {error?.details?.[0]?.message || 'An error occurred'}
      </div>
    ),
    [error],
  );

  const PreviewComponent = useMemo<JSX.Element>(() => {
    if (isLoading) return LoadingPreview;
    if (error && !presignedUrl) return ErrorPreview;
    if (!isPreviewable || !presignedUrl || !file) return UnsupportedPreview;

    const format = file.format.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(format);
    if (isImage) {
      return <ImagePreview url={presignedUrl} file={file} />;
    }

    if (format === 'pdf') {
      return <PDFPreview url={presignedUrl} />;
    }

    return UnsupportedPreview;
  }, [isLoading, error, isPreviewable, presignedUrl, file, ErrorPreview]);

  return {
    PreviewComponent,
    isLoading,
    error,
    isPreviewable,
  };
};
