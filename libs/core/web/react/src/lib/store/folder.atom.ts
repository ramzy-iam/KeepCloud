import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { atom } from 'jotai';

export interface ActiveFolder {
  id: string | null;
  name: string;
  system?: boolean;
}

export const DEFAULT_ACTIVE_FOLDER: ActiveFolder = SYSTEM_FILE.MY_STORAGE;

export const activeFolderAtom = atom<ActiveFolder>(DEFAULT_ACTIVE_FOLDER);
