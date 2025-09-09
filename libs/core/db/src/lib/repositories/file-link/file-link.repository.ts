import { Injectable } from '@nestjs/common';
import { FileLink, Prisma } from '@prisma/client';
import { BaseRepository } from '../base';
import { PrismaService } from '../../prisma';
import { FileLinkScope } from './file-link.scope';

@Injectable()
export class FileLinkRepository extends BaseRepository<
  FileLink,
  Prisma.FileLinkCreateInput,
  Prisma.FileLinkUpdateInput,
  Prisma.FileLinkWhereUniqueInput,
  Prisma.FileLinkWhereInput,
  Prisma.FileLinkInclude,
  Prisma.FileLinkOrderByWithRelationInput
> {
  constructor(protected readonly prismaService: PrismaService) {
    super('fileLink', prismaService);
  }

  get scoped(): FileLinkScope {
    return new FileLinkScope(this.prismaService, this);
  }
}
