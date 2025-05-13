import { PaginationDto } from '@keepcloud/commons/dtos';
import { PrismaService } from '../../prisma';
import { BaseRepository } from './base.repository';
import { PAGINATION } from '@keepcloud/commons/constants';
import { GenericPrismaModel } from './model';

export abstract class BaseScope<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
  WhereUniqueInput extends object,
  WhereInput extends object,
  Include extends object,
  OrderByWithRelationInput extends object,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: GenericPrismaModel<
      T,
      CreateInput,
      UpdateInput,
      WhereUniqueInput,
      WhereInput,
      Include,
      OrderByWithRelationInput
    >,
    private readonly repository: BaseRepository<
      T,
      CreateInput,
      UpdateInput,
      WhereUniqueInput,
      WhereInput,
      Include,
      OrderByWithRelationInput
    >,
  ) {}

  protected _where: WhereInput = {} as WhereInput;
  protected _include: Include = {} as Include;
  protected _orderBy: OrderByWithRelationInput = {} as OrderByWithRelationInput;

  orderBy(orderBy: OrderByWithRelationInput) {
    this._orderBy = orderBy;
    return this;
  }

  filterById(id: string) {
    (this._where as { id: string }).id = id;
    return this;
  }

  getOne(): Promise<T | null> {
    return this.repository.findOne({
      where: this._where,
      include: this._include,
    });
  }

  getMany(): Promise<T[]> {
    return this.repository.findMany({
      where: this._where,
      include: this._include,
    });
  }

  getManyPaginated(
    page: number = PAGINATION.DEFAULT_PAGE,
    pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
  ): Promise<PaginationDto<T>> {
    return this.repository.findManyPaginated(page, pageSize, {
      where: this._where,
      include: this._include,
      orderBy: this._orderBy,
    });
  }

  getOneOrFail(): Promise<T> {
    return this.repository.findOneOrFail({
      where: this._where,
      include: this._include,
    });
  }

  create(data: CreateInput): Promise<T> {
    return this.repository.create(data);
  }

  update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.repository.update(where, data);
  }

  delete(where: WhereUniqueInput): Promise<T> {
    return this.repository.delete(where);
  }
}
