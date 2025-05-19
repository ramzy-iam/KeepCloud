import { atom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export type DialogType = 'createFolder' | 'rename';

export interface DialogState {
  isOpen: boolean;
  type: DialogType | null;
  context: {
    folderId?: string | null;
    item?: FileMinViewDto;
  };
}

export const dialogAtom = atom<DialogState>({
  isOpen: false,
  type: null,
  context: {},
});
