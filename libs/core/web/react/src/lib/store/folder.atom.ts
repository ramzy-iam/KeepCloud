import { SystemFolder } from '@keepcloud/commons/constants';
import { atom } from 'jotai';

export interface ActiveFolder {
  id: string | null;
  name: string;
  system?: boolean;
}

export const DEFAULT_ACTIVE_FOLDER: ActiveFolder = {
  id: null,
  name: SystemFolder.MY_STORAGE,
  system: true,
};

export const activeFolderAtom = atom<ActiveFolder>(DEFAULT_ACTIVE_FOLDER);
