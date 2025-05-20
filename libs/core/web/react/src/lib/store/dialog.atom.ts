import { atom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { ErrorCode } from '@keepcloud/commons/constants';

type CommonDialogType = 'rename' | 'resourceTrashed' | 'deletePermanently';
type FolderDialogType = 'createFolder' | 'folderTrashed' | 'folderDeleted';
type FileDialogType = 'fileTrashed' | 'fileDeleted';

export type DialogType = CommonDialogType | FolderDialogType | FileDialogType;

export type DialogContext = {
  folderId?: string | null;
  item?: FileMinViewDto;
  isFolder?: boolean;
  code?: ErrorCode;
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
