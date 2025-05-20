import { Exclude, Expose, Type } from 'class-transformer';

export class MetaDto {
  @Expose()
  totalItems: number;

  @Expose()
  totalCurrentPage: number;

  @Expose()
  pageSize: number;

  @Expose()
  totalPages: number;

  @Expose()
  currentPage: number;

  @Expose()
  lastPage: number;

  @Expose()
  nextPage: number | null;

  @Expose()
  previousPage: number | null;

  @Expose()
  hasPreviousPage: boolean;

  @Expose()
  hasNextPage: boolean;
}

export class PaginationDto<T> {
  @Expose()
  @Type((options) => (options?.newObject as PaginationDto<T>).itemType)
  items: T[];

  @Type(() => MetaDto)
  @Expose()
  meta: MetaDto;

  @Exclude()
  private itemType: new (...args: unknown[]) => T;

  constructor(itemType: new (...args: unknown[]) => T) {
    this.itemType = itemType;
  }
}
