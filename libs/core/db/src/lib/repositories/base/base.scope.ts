import { PaginationDto } from '@keepcloud/commons/dtos';
import { PrismaService } from '../../prisma';
import { BaseRepository } from './base.repository';
import { PAGINATION } from '@keepcloud/commons/constants';

export class BaseScope<
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
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModel,
    private readonly repository: BaseRepository<
      T,
      CreateInput,
      UpdateInput,
      WhereUniqueInput,
      WhereInput,
      Include,
      PrismaModel
    >,
  ) {}
  protected _where: WhereInput = {} as WhereInput;
  protected _include: Include = {} as Include;

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
