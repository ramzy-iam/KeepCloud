import { atom } from 'jotai';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderViewMode } from '@keepcloud/commons/types';

export interface ActiveFolder {
  id: string;
  name: string;
  isSystem?: boolean;
  invalidationKey?: string;
}

export const folderViewAtom = atom<FolderViewMode>('grid');

export const DEFAULT_ACTIVE_FOLDER: ActiveFolder = SYSTEM_FILE.MY_STORAGE;

export const activeFolderAtom = atom<ActiveFolder>(DEFAULT_ACTIVE_FOLDER);
