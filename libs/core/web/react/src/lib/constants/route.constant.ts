import { SYSTEM_FILE } from '@keepcloud/commons/constants';

export const ROUTE_PATH = {
  home: '/home',
  login: '/auth',
  folder: '/folders',
  explorer: '/home/explorer',
  sharedWithMe: '/home/shared-with-me',
  fileRequest: '/home/file-request',
  trash: '/home/trash',
  folderDetails(folderId: string) {
    return `/folders/${folderId}`;
  },

  system(code?: string) {
    switch (code) {
      case SYSTEM_FILE.MY_STORAGE.code:
        return this.folder;
      case SYSTEM_FILE.SHARED_WITH_ME.code:
        return this.sharedWithMe;
      case SYSTEM_FILE.TRASH.code:
        return this.trash;
      default:
        return '/';
    }
  },
};
