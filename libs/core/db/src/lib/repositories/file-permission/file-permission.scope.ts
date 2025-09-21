import { Injectable } from '@nestjs/common';
import { FilePermission, FilePermissionRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base/base.scope';
import { FilePermissionRepository } from './file-permission.repository';

@Injectable()
export class FilePermissionScope extends BaseScope<
  FilePermission,
  Prisma.FilePermissionCreateInput,
  Prisma.FilePermissionUpdateInput,
  Prisma.FilePermissionWhereUniqueInput,
  Prisma.FilePermissionWhereInput,
  Prisma.FilePermissionInclude,
  Prisma.FilePermissionOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected repository: FilePermissionRepository,
  ) {
    super(prismaService, repository);
  }

  filterByFileId(fileId: string) {
    this._where.fileId = fileId;
    return this;
  }

  filterByUserId(userId: string) {
    this._where.userId = userId;
    return this;
  }

  filterByGrantedById(grantedById: string) {
    this._where.grantedById = grantedById;
    return this;
  }

  filterByRole(role: FilePermissionRole) {
    this._where.role = role;
    return this;
  }

  joinFile(): this {
    this._include.file = true;
    return this;
  }

  joinUser(): this {
    this._include.user = true;
    return this;
  }

  joinGrantedBy(): this {
    this._include.grantedBy = true;
    return this;
  }
}
