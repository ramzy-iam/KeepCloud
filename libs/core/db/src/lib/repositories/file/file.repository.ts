import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileScope } from './file.scope';
import { File } from '../../entities';
import { BaseRepository } from '../base';
import { PrismaService } from '../../prisma';

@Injectable()
export class FileRepository extends BaseRepository<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  PrismaService['file'],
  FileScope
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.file, new FileScope(prisma));
  }
}
