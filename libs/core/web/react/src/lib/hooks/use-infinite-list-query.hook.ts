import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { getFileListAtom } from '../atoms';
import { FileMinViewDto, PaginationDto } from '@keepcloud/commons/dtos';
import { ApiErrorData } from '../services';

interface UseInfiniteListQueryOptions<T extends FileMinViewDto> {
  queryKey: readonly unknown[];
  enabled?: boolean;
  fetchFn: (page: number, pageSize?: number) => Promise<PaginationDto<T>>;
  listKey: string;
  pageSize?: number;
  staleTime?: number;
}

export function useInfiniteListQuery<T extends FileMinViewDto>({
  queryKey,
  fetchFn,
  enabled = true,
  listKey,
  staleTime,
}: UseInfiniteListQueryOptions<T>) {
  const atom = getFileListAtom(listKey);
  const [list, setList] = useAtom(atom);

  const query = useInfiniteQuery<PaginationDto<T>, ApiErrorData>({
    queryKey,
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return fetchFn(pageParam as number);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.nextPage : undefined,
    retry: false,
    staleTime,
  });

  useEffect(() => {
    if (query.data) {
      const allItems = query.data.pages.flatMap((page) => page.items);
      setList(allItems);
    }
  }, [query.data, setList]);
  const lastPageData = query.data
    ? query.data.pages[query.data.pages.length - 1]
    : undefined;
  const updatedData: PaginationDto<T> | undefined = lastPageData
    ? ({
        ...lastPageData,
        items: list,
      } as PaginationDto<T>)
    : undefined;

  return {
    ...query,
    pagination: updatedData?.meta,
    allPageItems: updatedData?.items,
    currentPageItems: lastPageData?.items,
    paginationProps: {
      fetchNextPage: query.fetchNextPage,
      hasNextPage: query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
    },
  };
}
