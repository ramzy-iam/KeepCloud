import { PrismaClient } from '@prisma/client';

export class BaseScope<
  T extends object,
  WhereInput extends object,
  Include extends object,
  PrismaModel extends {
    findMany: (args: { where: WhereInput; include: Include }) => Promise<T[]>;
    findFirst: (args: {
      where: WhereInput;
      include: Include;
    }) => Promise<T | null>;
    findFirstOrThrow: (args: { where: WhereInput }) => Promise<T>;
  },
> {
  protected where: WhereInput = {} as WhereInput;
  protected include: Include = {} as Include;

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: PrismaModel,
  ) {}

  filterById(id: string) {
    (this.where as { id: string }).id = id;
    return this;
  }

  async findMany(): Promise<T[]> {
    return this.model.findMany({
      where: this.where,
      include: this.include,
    });
  }

  async findOne(): Promise<T | null> {
    return this.model.findFirst({
      where: this.where,
      include: this.include,
    });
  }

  async findOneOrFail(): Promise<T> {
    return this.model.findFirstOrThrow({
      where: this.where,
    });
  }
}
