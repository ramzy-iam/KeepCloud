import { Injectable } from '@nestjs/common';
import { File } from '../../entities';
import { BaseRepository } from '../base';
import { PrismaService, Prisma } from '../../prisma';
import { FileAncestorDto } from '@keepcloud/commons/dtos';
import { FileScope } from './file.scope';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';

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
  constructor(protected readonly prismaService: PrismaService) {
    super('file', prismaService);
  }

  get scoped(): FileScope {
    return new FileScope(this.prismaService, this);
  }

  async getAncestors(id: string): Promise<FileAncestorDto[]> {
    const file = await this.prisma.file.findFirstOrThrow({
      where: { id },
      select: { id: true, name: true, parentId: true },
    });

    const ancestors: FileAncestorDto[] = [];
    let currentId = file.parentId;

    while (currentId) {
      const parent = await this.prisma.file.findFirst({
        where: { id: currentId, parentId: { not: null } },
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

  async isTrashed(fileId: string): Promise<{
    trashed: boolean;
    trashedBy: 'self' | 'parent' | null;
    isFolder: boolean;
  }> {
    // First, check the file itself
    const targetFile = await this.prisma.file.findFirst({
      where: { id: fileId },
      select: {
        id: true,
        trashedAt: true,
        parentId: true,
        isFolder: true,
      },
    });

    if (!targetFile) {
      return { trashed: false, trashedBy: null, isFolder: false };
    }

    const isFolder = targetFile.isFolder;
    const isFileTrashed = targetFile.trashedAt !== null;

    // Check parent hierarchy first (priority to parent)
    let currentId: string | null = targetFile.parentId;

    while (currentId) {
      const parentFile = await this.prisma.file.findFirst({
        where: { id: currentId },
        select: {
          id: true,
          trashedAt: true,
          parentId: true,
        },
      });

      if (!parentFile) {
        // Parent not found, break the chain
        break;
      }

      if (parentFile.trashedAt !== null) {
        return {
          trashed: true,
          trashedBy: 'parent',
          isFolder,
        };
      }

      // Move to next parent
      currentId = parentFile.parentId;
    }

    // No parent is trashed, check if the file itself is trashed
    if (isFileTrashed) {
      return {
        trashed: true,
        trashedBy: 'self',
        isFolder,
      };
    }

    // Neither the file nor any parent is trashed
    return { trashed: false, trashedBy: null, isFolder };
  }

  isFolder(file: File): boolean {
    return file.isFolder;
  }

  getRootFolder(userId?: string): Promise<File> {
    const scope = this.scoped;
    if (userId) {
      scope.filterByOwnerId(userId);
    }
    return scope
      .filterByParentId(null)
      .filterByExactName(SYSTEM_FILE.MY_STORAGE.code)
      .filterByIsSystem(true)
      .getOneOrFail();
  }
}
