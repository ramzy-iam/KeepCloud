import { FileMinViewDto } from '@keepcloud/commons/dtos';
import {
  FolderIcon,
  PdfIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  ArchiveIcon,
  AudioIcon,
} from '../components/misc';
import { MimeTypes } from '@keepcloud/commons/constants';

export const useFileIcon = (file?: FileMinViewDto) => {
  if (!file) return null;
  if (file.isFolder) return FolderIcon;

  const contentType = file.contentType ?? '';
  const name = file.name?.toLowerCase() ?? '';

  if (isPdf(contentType)) return PdfIcon;
  if (isImage(contentType)) return ImageIcon;
  if (isVideo(contentType)) return VideoIcon;
  if (isArchive(contentType, name)) return ArchiveIcon;
  if (isAudio(contentType)) return AudioIcon;

  return FileIcon;
};

function isPdf(contentType: string) {
  return contentType === MimeTypes.pdf;
}

function isImage(contentType: string) {
  return contentType.startsWith('image/');
}

function isVideo(contentType: string) {
  return contentType.startsWith('video/');
}

function isAudio(contentType: string) {
  return contentType.startsWith('audio/');
}

function isArchive(contentType: string, name: string) {
  const archiveMimeTypes = [
    MimeTypes.zip,
    MimeTypes.rar,
    MimeTypes.tar,
    MimeTypes.bz2,
    MimeTypes.xz,
    MimeTypes.iso,
  ];

  const archiveExtensions = [
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
    '.bz2',
    '.xz',
    '.iso',
  ];

  return (
    archiveMimeTypes.includes(contentType) ||
    archiveExtensions.some((ext) => name.endsWith(ext))
  );
}
