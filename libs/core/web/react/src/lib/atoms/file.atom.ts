import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { atom } from 'jotai';

export const fileListAtoms: Record<
  string,
  ReturnType<typeof atom<FileMinViewDto[]>>
> = {};

export function getFileListAtom(listId: string) {
  if (!fileListAtoms[listId]) {
    fileListAtoms[listId] = atom<FileMinViewDto[]>([]);
  }
  return fileListAtoms[listId];
}
