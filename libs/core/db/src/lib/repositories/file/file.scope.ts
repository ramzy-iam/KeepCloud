import { File } from '../../entities';
import { FileFormat } from '@keepcloud/commons/constants';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base';

export class FileScope extends BaseScope<
  File,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  PrismaClient['file']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.file);
  }

  filterByOwnerId(id: string) {
    this._where.ownerId = id;
    return this;
  }

  filterByParentId(id: string | null) {
    this._where.parentId = id;
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

  filterByFormat(format: FileFormat) {
    this._where.format = format;
    return this;
  }

  filterByTemporaryDeletedAt(date: Date) {
    this._where.trashedAt = date;
  }

  filterByTrashed(): this {
    this._where.trashedAt = { not: null };
    return this;
  }

  filterByNotTrashed(): this {
    this._where.trashedAt = null;
    return this;
  }
}
