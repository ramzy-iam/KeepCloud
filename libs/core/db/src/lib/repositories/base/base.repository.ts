import { PAGINATION } from '@keepcloud/commons/constants';
import { PrismaService } from '../../prisma';
import { PaginationDto, MetaDto } from '@keepcloud/commons/dtos';

export class BaseRepository<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
  WhereUniqueInput extends object,
  WhereInput extends object,
  PrismaModel extends {
    findFirst: (args: { where: WhereInput }) => Promise<T | null>;
    findUnique: (args: { where: WhereUniqueInput }) => Promise<T | null>;
    findMany: (args: {
      where?: WhereInput;
      skip?: number;
      take?: number;
    }) => Promise<T[]>;
    count: (args: { where?: WhereInput }) => Promise<number>;
    create: (args: { data: CreateInput }) => Promise<T>;
    update: (args: {
      where: WhereUniqueInput;
      data: UpdateInput;
    }) => Promise<T>;
    delete: (args: { where: WhereUniqueInput }) => Promise<T>;
  },
  Scope,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModel,
    protected readonly scope: Scope,
  ) {}

  get scoped(): Scope {
    return this.scope;
  }

  async findOne(where: WhereInput): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  async findMany(where?: WhereInput): Promise<T[]> {
    return this.model.findMany({ where });
  }

  async findManyPaginated(
    where?: WhereInput,
    page: number = PAGINATION.DEFAULT_PAGE,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
  ): Promise<PaginationDto<T>> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(
      1,
      Math.min(pageSize, PAGINATION.DEFAULT_MAX_PAGE_SIZE),
    );

    const skip = (safePage - 1) * safePageSize;

    const [items, totalItems] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: safePageSize,
      }),
      this.model.count({ where }),
    ]);

    const totalPages =
      totalItems > 0 ? Math.ceil(totalItems / safePageSize) : 1;
    const currentPage = safePage;
    const totalCurrentPage = items.length;
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    const nextPage = hasNextPage ? currentPage + 1 : null;
    const previousPage = hasPreviousPage ? currentPage - 1 : null;
    const lastPage = totalPages;

    const meta: MetaDto = {
      totalItems,
      totalCurrentPage,
      pageSize: safePageSize,
      totalPages,
      currentPage,
      lastPage,
      nextPage,
      previousPage,
      hasPreviousPage,
      hasNextPage,
    };

    return {
      items,
      meta,
    } as PaginationDto<T>;
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }
}
