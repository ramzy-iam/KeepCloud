import { PAGINATION } from '@keepcloud/commons/constants';
import { PrismaService } from '../../prisma';
import { PaginationDto, MetaDto } from '@keepcloud/commons/dtos';

export interface Scoped<T> {
  readonly scoped: T;
}

export abstract class BaseRepository<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
  WhereUniqueInput extends object,
  WhereInput extends object,
  Include extends object,
  PrismaModel extends {
    findFirst: (args: {
      where: WhereInput;
      include: Include;
    }) => Promise<T | null>;
    findMany: (args: {
      where?: WhereInput;
      include?: Include;
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
    findFirstOrThrow: (args: {
      where?: WhereInput;
      include?: Include;
    }) => Promise<T>;
  },
> implements Scoped<unknown>
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModel,
  ) {}

  abstract get scoped(): unknown;

  async findOne({
    where,
    include,
  }: { where?: WhereInput; include?: Include } = {}) {
    return this.model.findFirst({
      where: where ?? ({} as WhereInput),
      include: include ?? ({} as Include),
    });
  }

  async findMany({
    where,
    include,
  }: { where?: WhereInput; include?: Include } = {}) {
    return this.model.findMany({
      where,
      include,
    });
  }

  async findManyPaginated(
    page: number = PAGINATION.DEFAULT_PAGE,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
    { where, include }: { where?: WhereInput; include?: Include } = {},
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
        include,
        skip,
        take: safePageSize,
      }),
      this.model.count({ where }),
    ]);
    const meta: MetaDto = this.buildPaginationMeta(
      totalItems,
      safePageSize,
      safePage,
    );
    return {
      items,
      meta,
    } as PaginationDto<T>;
  }

  private buildPaginationMeta(
    totalItems: number,
    pageSize: number,
    currentPage: number,
  ): MetaDto {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return {
      totalItems,
      totalCurrentPage: Math.min(pageSize, totalItems),
      pageSize,
      totalPages,
      currentPage,
      lastPage: totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }

  async findOneOrFail({
    where,
    include,
  }: {
    where?: WhereInput;
    include?: Include;
  } = {}): Promise<T> {
    return this.model.findFirstOrThrow({
      where,
      include,
    });
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
