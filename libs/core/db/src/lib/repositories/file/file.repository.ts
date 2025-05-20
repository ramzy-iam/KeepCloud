import { Injectable } from '@nestjs/common';
import { File } from '../../entities';
import { BaseRepository } from '../base';
import { PrismaService, Prisma } from '../../prisma';
import { FileAncestor } from '@keepcloud/commons/dtos';
import { FileScope } from './file.scope';

@Injectable()
export class FileRepository extends BaseRepository<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  Prisma.FileOrderByWithRelationInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.file);
  }

  get scoped(): FileScope {
    return new FileScope(this.prisma, this);
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

  async isTrashed(
    fileId: string,
  ): Promise<{
    trashed: boolean;
    trashedBy: 'self' | 'parent' | null;
    isFolder: boolean;
  }> {
    let currentId: string | null = fileId;
    let isFolder = false;

    while (currentId) {
      const file: Pick<
        File,
        'id' | 'trashedAt' | 'parentId' | 'contentType'
      > | null = await this.prisma.file.findFirst({
        where: { id: currentId },
        select: {
          id: true,
          trashedAt: true,
          parentId: true,
          contentType: true,
        },
      });

      if (!file) {
        return { trashed: false, trashedBy: null, isFolder: false };
      }

      // Capture if the original file is a folder
      if (file.id === fileId) {
        isFolder = file.contentType === 'folder';
      }

      if (file.trashedAt !== null) {
        return {
          trashed: true,
          trashedBy: file.id === fileId ? 'self' : 'parent',
          isFolder,
        };
      }

      currentId = file.parentId;
    }

    return { trashed: false, trashedBy: null, isFolder };
  }
}
