import { PAGINATION } from '@keepcloud/commons/constants';
import { PaginationDto, MetaDto } from '@keepcloud/commons/dtos';
import { GenericPrismaModel } from './model';
import { Prisma, RLSContextService } from '../../prisma';
import { PrismaClient } from '@prisma/client';

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
  OrderByWithRelationInput extends object,
> {
  constructor(private modelName: Prisma.TypeMap['meta']['modelProps']) {}

  abstract get scoped(): unknown;

  get model() {
    return RLSContextService.prisma![
      this.modelName
    ] as unknown as GenericPrismaModel<
      T,
      CreateInput,
      UpdateInput,
      WhereUniqueInput,
      WhereInput,
      Include,
      OrderByWithRelationInput
    >;
  }

  protected get prisma(): PrismaClient {
    return RLSContextService.prisma;
  }

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
    orderBy,
  }: {
    where?: WhereInput;
    include?: Include;
    orderBy?: OrderByWithRelationInput;
  } = {}) {
    return this.model.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findManyPaginated(
    page: number = PAGINATION.DEFAULT_PAGE,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
    {
      where,
      include,
      orderBy,
    }: {
      where?: WhereInput;
      include?: Include;
      orderBy?: OrderByWithRelationInput;
    } = {},
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
        orderBy,
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
