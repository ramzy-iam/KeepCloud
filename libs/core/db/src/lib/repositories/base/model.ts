export interface GenericPrismaModel<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
  WhereUniqueInput extends object,
  WhereInput extends object,
  Include extends object,
  OrderByWithRelationInput extends object,
> {
  findFirst: (args: {
    where: WhereInput;
    include: Include;
  }) => Promise<T | null>;

  findMany: (args: {
    where?: WhereInput;
    include?: Include;
    orderBy?: OrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) => Promise<T[]>;

  count: (args: { where?: WhereInput }) => Promise<number>;

  create: (args: { data: CreateInput }) => Promise<T>;

  update: (args: { where: WhereUniqueInput; data: UpdateInput }) => Promise<T>;

  delete: (args: { where: WhereUniqueInput }) => Promise<T>;

  findFirstOrThrow: (args: {
    where?: WhereInput;
    include?: Include;
  }) => Promise<T>;
}
