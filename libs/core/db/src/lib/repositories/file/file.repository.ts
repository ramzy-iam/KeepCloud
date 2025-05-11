import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { File } from '../../entities';
import { BaseRepository } from '../base';
import { PrismaService } from '../../prisma';
import { FileAncestor } from '@keepcloud/commons/dtos';
import { FileFormat } from '@keepcloud/commons/constants';

@Injectable()
export class FileRepository extends BaseRepository<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  PrismaClient['file']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.file);
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

  filterByOwnerId(id: string) {
    this._where.ownerId = id;
    return this;
  }

  filterByParentId(id: string | null | undefined) {
    this._where.parentId = id ?? null;
    return this;
  }

  filerByIsFolder() {
    this._where.type = 'FOLDER';
    return this;
  }

  filterByType(type: File['type']) {
    this._where.type = type;
    return this;
  }

  filterByName(name: string) {
    this._where.name = { contains: name, mode: 'insensitive' };
    return this;
  }

  filterByExactName(name: string) {
    this._where.name = name;
    return this;
  }

  filterByFormat(format: FileFormat) {
    this._where.format = format;
    return this;
  }

  filterByTemporaryDeletedAt(date: Date) {
    this._where.trashedAt = date;
    return this;
  }

  filterByTrashed() {
    this._where.trashedAt = { not: null };
    return this;
  }

  filterByNotTrashed() {
    this._where.trashedAt = null;
    return this;
  }

  joinOwner(): this {
    this._include.owner = true;
    return this;
  }
}
