import { Prisma } from '@prisma/client';
import { GenericPrismaModel } from '../base/model';
import { File } from '../../models';

export type FileModel = GenericPrismaModel<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  Prisma.FileOrderByWithRelationInput
>;
