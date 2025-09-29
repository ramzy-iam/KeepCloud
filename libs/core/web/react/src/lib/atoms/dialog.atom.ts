import { atom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { ErrorCode } from '@keepcloud/commons/constants';
import { ActionCompleteCallback } from '@keepcloud/commons/types';

type CommonDialogType =
  | 'rename'
  | 'resourceTrashed'
  | 'deletePermanently'
  | 'bulkDeleteConfirmation'
  | 'shareFile';
type FolderDialogType =
  | 'createFolder'
  | 'folderTrashed'
  | 'folderDeleted'
  | 'folderNotFound'
  | 'fileInfo';
type FileDialogType = 'fileTrashed' | 'fileDeleted' | 'previewFile';

export type DialogType = CommonDialogType | FolderDialogType | FileDialogType;

export type DialogContext = {
  folderId?: string | null;
  item?: FileMinViewDto;
  items?: FileMinViewDto[]; // For bulk operations
  isFolder?: boolean;
  code?: ErrorCode;
  onActionComplete?: ActionCompleteCallback<FileMinViewDto[]>;
};

export interface DialogState {
  isOpen: boolean;
  type: DialogType | null;
  context: DialogContext;
}

export const dialogAtom = atom<DialogState>({
  isOpen: false,

  type: null,
  context: {},
});
