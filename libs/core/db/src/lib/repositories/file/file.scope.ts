import { Injectable } from '@nestjs/common';
import { File } from '../../entities';
import { PrismaService, Prisma } from '../../prisma';
import { FileFormat } from '@keepcloud/commons/constants';
import { BaseScope } from '../base/base.scope';
import { FileRepository } from './file.repository';

@Injectable()
export class FileScope extends BaseScope<
  File,
  Prisma.FileCreateInput,
  Prisma.FileUpdateInput,
  Prisma.FileWhereUniqueInput,
  Prisma.FileWhereInput,
  Prisma.FileInclude,
  Prisma.FileOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected repository: FileRepository,
  ) {
    super(prismaService, repository);
  }

  filterByOwnerId(id: string) {
    this._where.ownerId = id;
    return this;
  }

  filterByParentId(id?: string | null | undefined) {
    if (typeof id === 'undefined') return this;
    this._where.parentId = id;
    return this;
  }

  filerByIsFolder() {
    this._where.isFolder = true;
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
