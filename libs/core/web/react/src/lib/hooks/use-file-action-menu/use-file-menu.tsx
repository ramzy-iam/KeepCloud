import {
  Info,
  Download,
  Trash2,
  TextCursorInput as RenameIcon,
  Eye as PreviewIcon,
  History,
  Share,
} from 'lucide-react';
import {
  MenuItem,
  useDialog,
  useMoveToTrash,
  useRestoreResource,
  useGeneratePresignedGet,
} from '../';
import { iconClassName, itemClassName } from './config';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { cn } from '../../helpers';
import { FileHelper } from '@keepcloud/commons/helpers';
import { toast } from 'sonner';

export const useFileMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const { openDialog } = useDialog();

  const moveToTrash = useMoveToTrash({
    parentId: FileHelper.getValidParentId(file.parentId),
  });

  const { refetch: getPresignedUrls } = useGeneratePresignedGet({
    fileId: file.id,
    enabled: false,
  });

  const handleDownload = async () => {
    try {
      const { data: presignedData } = await getPresignedUrls();

      if (presignedData?.downloadUrl) {
        window.open(presignedData.downloadUrl, '_blank');
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${file.name}`);
    }
  };
  return [
    {
      label: 'Preview',
      icon: <PreviewIcon className={iconClassName} />,
      onClick: () =>
        openDialog({
          type: 'previewFile',
          item: file,
        }),
      className: itemClassName,
    },
    {
      label: 'Download',
      icon: <Download className={iconClassName} />,
      onClick: handleDownload,
      className: itemClassName,
    },
    {
      label: 'Rename',
      icon: <RenameIcon className={iconClassName} />,
      onClick: () =>
        openDialog({
          type: 'rename',
          item: file,
        }),
      className: itemClassName,
    },
    {
      label: 'Share',
      icon: <Share className={iconClassName} />,
      onClick: () =>
        openDialog({
          type: 'shareFile',
          item: file,
        }),
      className: itemClassName,
    },
    {
      label: 'Info',
      icon: <Info className={iconClassName} />,
      onClick: () =>
        openDialog({
          type: 'fileInfo',
          item: file,
        }),
      className: itemClassName,
    },
    {
      label: 'Move to Trash',
      icon: <Trash2 className={iconClassName} />,
      onClick: () => moveToTrash.mutate(file.id),
      className: itemClassName,
    },
  ];
};

export const useTrashedFileMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const { openDialog } = useDialog();
  const restoreFile = useRestoreResource();

  return [
    {
      label: 'Restore',
      icon: <History className={iconClassName} />,
      onClick: () => {
        restoreFile.mutate(file.id);
      },
      className: itemClassName,
    },

    {
      label: 'Delete permanently',
      icon: (
        <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
      ),
      onClick: () => {
        openDialog({
          type: 'deletePermanently',
          item: file,
        });
      },
      className: cn(itemClassName, 'text-error-500! hover:text-error-500!'),
    },
  ];
};
