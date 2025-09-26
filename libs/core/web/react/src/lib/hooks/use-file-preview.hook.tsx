import { JSX, useMemo } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useGeneratePresignedGet } from './file.hook';
import {
  ImagePreview,
  LoadingPreview,
  PDFPreview,
  TextPreview,
  OfficePreview,
  UnsupportedPreview,
} from '../components';

interface UseFilePreviewerProps {
  file?: FileMinViewDto;
}

const supportedFormats = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'txt',
  'doc',
  'docx',
  'xls',
  'xlsx',
];

export const useFilePreviewer = ({ file }: UseFilePreviewerProps) => {
  const isPreviewable = useMemo(() => {
    return Boolean(
      file?.format && supportedFormats.includes(file.format.toLowerCase()),
    );
  }, [file?.format]);

  const { isLoading, error, data } = useGeneratePresignedGet({
    fileId: file?.id,
    enabled: isPreviewable,
  });
  const { previewUrl, downloadUrl } = data ?? {};

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
    if (error && !previewUrl) return ErrorPreview;
    if (!isPreviewable || !previewUrl || !file) return UnsupportedPreview;

    const format = file.format.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(format)) {
      return <ImagePreview url={previewUrl} file={file} />;
    }

    if (format === 'pdf') {
      return <PDFPreview url={previewUrl} />;
    }

    if (format === 'txt') {
      return <TextPreview url={previewUrl} />;
    }

    if (['doc', 'docx', 'xls', 'xlsx'].includes(format)) {
      return <OfficePreview url={previewUrl} />;
    }

    return UnsupportedPreview;
  }, [isLoading, error, isPreviewable, previewUrl, file, ErrorPreview]);

  return {
    PreviewComponent,
    isLoading,
    error,
    isPreviewable,
    downloadUrl,
  };
};
