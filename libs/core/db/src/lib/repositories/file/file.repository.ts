import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { FileScope } from './file.scope';
import { File } from '../../entities';
import { BaseRepository } from '../base';
import { PrismaService } from '../../prisma';
import { FileAncestor } from '@keepcloud/commons/dtos';

@Injectable()
export class FileRepository extends BaseRepository<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  PrismaClient['file'],
  FileScope
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.file, new FileScope(prisma));
  }

  async getAncestors(id: string): Promise<FileAncestor[]> {
    const file = await this.prisma.file.findFirstOrThrow({
      where: { id },
      select: { id: true, name: true, parentId: true },
    });

    const ancestors: FileAncestor[] = [];
    let currentId = file.parentId;

    while (currentId) {
      const parent = await this.prisma.file.findFirst({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });

      if (!parent) {
        // Reached the root folder
        break;
      }

      ancestors.unshift({ id: parent.id, name: parent.name });
      currentId = parent.parentId;
    }
    return ancestors;
  }
}
