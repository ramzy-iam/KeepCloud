import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { UseQueryResult } from '@tanstack/react-query';
import { getFileListAtom } from '../atoms';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { ApiErrorData } from '../services';

export function useSyncedListFromQuery<
  T extends { items: FileMinViewDto[] } | FileMinViewDto[],
>(
  query: UseQueryResult<T, ApiErrorData>,
  listKey: string,
): UseQueryResult<T, ApiErrorData> {
  const atom = getFileListAtom(listKey);
  const [list, setList] = useAtom(atom);

  useEffect(() => {
    if (!query.data) return;

    const newItems = Array.isArray(query.data) ? query.data : query.data.items;

    if (newItems) {
      setList(newItems);
    }
  }, [query.data, setList]);

  const updatedData = query.data
    ? Array.isArray(query.data)
      ? (list as T)
      : ({ ...query.data, items: list } as T)
    : undefined;

  return {
    ...query,
    data: updatedData,
  } as UseQueryResult<T, ApiErrorData>;
}
