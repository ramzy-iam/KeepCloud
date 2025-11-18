import { useCallback } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useAtom } from 'jotai';
import { fileListAtoms, getFileListAtom, store } from '../atoms';
import { FileHelper } from '@keepcloud/commons/helpers';

type InsertPosition = 'start' | 'end';

export function useFileListUpdater(listId: string) {
  const atom = getFileListAtom(listId);
  const [list, setList] = useAtom(atom);

  const insertItem = useCallback(
    (item: FileMinViewDto, position: InsertPosition = 'end') => {
      setList((current) =>
        position === 'start' ? [item, ...current] : [...current, item],
      );
    },
    [setList],
  );

  const updateItemName = useCallback(
    (id: string, newName: string) => {
      setList((current) =>
        current.map((file) =>
          file.id === id ? { ...file, name: newName } : file,
        ),
      );
    },
    [setList],
  );

  const removeItem = useCallback(
    (id: string) => {
      setList((current) => current.filter((file) => file.id !== id));
    },
    [setList],
  );

  const replaceAll = useCallback(
    (items: FileMinViewDto[]) => {
      setList(items);
    },
    [setList],
  );

  return { list, insertItem, updateItemName, removeItem, replaceAll };
}

export function updateFileEverywhere(
  fileId: string,
  updater: (f: FileMinViewDto) => FileMinViewDto | null,
) {
  for (const atom of Object.values(fileListAtoms)) {
    const current = store.get(atom);
    const next = current
      .map((f) => (f.id === fileId ? updater(f) : f))
      .filter(Boolean) as FileMinViewDto[];
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      store.set(atom, next);
    }
  }
}

export function removeFileEverywhere(
  fileId: string,
  excludeListIds: string[] = [],
) {
  for (const [listId, atom] of Object.entries(fileListAtoms)) {
    // Skip removal if this listId is in the exclude array
    if (excludeListIds.includes(listId)) {
      continue;
    }

    const current = store.get(atom);
    const next = current.filter((f) => f.id !== fileId);

    if (current.length !== next.length) {
      store.set(atom, next);
    }
  }
}

export const insertFileToList = (
  file: FileMinViewDto,
  folderId?: string,
  position: InsertPosition = 'end',
) => {
  const finalFolderId = folderId ?? FileHelper.getValidParentId(file.parentId);
  const atom = getFileListAtom(finalFolderId);
  const current = store.get(atom) || [];
  const next = position === 'start' ? [file, ...current] : [...current, file];
  store.set(atom, next);
};

export const removeFileFromList = (
  fileId: string,
  folderId?: string,
  parentId?: string,
) => {
  const finalFolderId = folderId ?? FileHelper.getValidParentId(parentId ?? '');
  const atom = getFileListAtom(finalFolderId);
  const current = store.get(atom) || [];
  store.set(
    atom,
    current.filter((f) => f.id !== fileId),
  );
};
