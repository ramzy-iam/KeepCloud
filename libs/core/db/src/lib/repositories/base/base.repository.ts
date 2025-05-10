import { PrismaService } from '../../prisma';

export class BaseRepository<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
  WhereUniqueInput extends object,
  WhereInput extends object,
  PrismaModel extends {
    findFirst: (args: { where: WhereInput }) => Promise<T | null>;
    findUnique: (args: { where: WhereUniqueInput }) => Promise<T | null>;
    findMany: (args: { where?: WhereInput }) => Promise<T[]>;
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
