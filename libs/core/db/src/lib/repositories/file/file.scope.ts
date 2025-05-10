import { File } from '../../entities';
import { FileFormat } from '@keepcloud/commons/constants';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base';

export class FileScope extends BaseScope<
  File,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  PrismaService['file']
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.file);
  }

  filterByOwnerId(id: string) {
    this.where.ownerId = id;
  }

  filterByParentId(id: string | null) {
    this.where.parentId = id;
  }

  filerByIsFolder() {
    this.where.type = 'FOLDER';
  }

  filterByName(name: string) {
    return (this.where.name = { contains: name, mode: 'insensitive' });
  }

  filterByFormat(format: FileFormat) {
    this.where.format = format;
  }

  filterByTemporaryDeletedAt(date: Date) {
    this.where.trashedAt = date;
  }

  filterByTrashed(): this {
    this.where.trashedAt = { not: null };
    return this;
  }

  filterByNotTrashed(): this {
    this.where.trashedAt = null;
    return this;
  }
}
