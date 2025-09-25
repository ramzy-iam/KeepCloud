import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderFilterDto, GetOneFolderQueryDto } from '@keepcloud/commons/dtos';

const createQueryKey = (
  domain: string,
  ...rest: (string | number | boolean | object)[]
) => [domain, ...rest];

/**
 * Helper function to get invalidation key based on active folder
 * @param activeFolder - The active folder object
 * @returns Query key array for invalidation
 */
export const getActiveFolderInvalidationKey = (activeFolder: {
  id: string;
  isSystem?: boolean;
  invalidationKey?: string;
}) => {
  if (activeFolder.isSystem && activeFolder.invalidationKey) {
    return [activeFolder.invalidationKey];
  }
  return folderKeys.children(activeFolder.id);
};

/**
 * Storage Query Keys
 */
export const storageKeys = {
  all: ['storage'],

  myStorage: [SYSTEM_FILE.MY_STORAGE.invalidationKey],
  sharedWithMe: [SYSTEM_FILE.SHARED_WITH_ME.invalidationKey],
  trash: [SYSTEM_FILE.TRASH.invalidationKey],

  suggestedFolders: ['storage', 'suggested-folders'],
  suggestedFiles: ['storage', 'suggested-files'],
  tree: ['storage', 'tree'],
  usage: ['storage', 'usage'],
  breakdown: ['storage', 'breakdown'],
} as const;

/**
 * Folder Query Keys
 */
export const folderKeys = {
  all: ['folder'],
  detail: (id: string, query?: GetOneFolderQueryDto) =>
    createQueryKey('folder', id, query?.withAncestors ?? true),
  children: (id: string) => createQueryKey('folder', id, 'children'),
  childrenWithFilters: (id: string, filters: FolderFilterDto) =>
    createQueryKey('folder', id, 'children', filters),
} as const;

/**
 * File Query Keys
 */
export const fileKeys = {
  all: ['file'],
  detail: (id: string) => createQueryKey('file', id),
  presignedGet: (fileId: string) =>
    createQueryKey('file', fileId, 'presigned-get'),
} as const;

/**
 * User Query Keys
 */
export const userKeys = {
  list: (filters: object) => createQueryKey('users', filters),
} as const;

/**
 * Auth Query Keys
 */
export const authKeys = {
  profile: ['profile'],
} as const;

export const queryKeys = {
  storage: storageKeys,
  folder: folderKeys,
  file: fileKeys,
  user: userKeys,
  auth: authKeys,
} as const;
