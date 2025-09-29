import { Injectable } from '@nestjs/common';
import { File, FilePermissionRole } from '../../models';
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

  filterByTreeOwnerId(id: string) {
    this._where.treeOwnerId = id;
    return this;
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

  filterByIsSystem(isSystem: boolean) {
    this._where.isSystem = isSystem;
    return this;
  }

  filterByIds(ids: string[]) {
    this._where.id = { in: ids };
    return this;
  }

  /**
   * Filter files that the user has access to (owner or shared permissions)
   */
  filterByUserAccess(userId: string) {
    this._where.OR = [
      { ownerId: userId },
      { treeOwnerId: userId },
      {
        permissions: {
          some: {
            userId: userId,
          },
        },
      },
    ];
    return this;
  }

  /**
   * Filter files by minimum permission role
   */
  filterByUserPermission(userId: string, minimumRole?: FilePermissionRole) {
    if (minimumRole) {
      this._where.OR = [
        { ownerId: userId },
        {
          permissions: {
            some: {
              userId: userId,
              role: minimumRole,
            },
          },
        },
      ];
    } else {
      return this.filterByUserAccess(userId);
    }
    return this;
  }

  /**
   * Join permissions for access control
   */
  joinPermissions(): this {
    this._include.permissions = {
      include: {
        user: true,
        grantedBy: true,
      },
    };
    return this;
  }

  /**
   * Filter files that the user has hierarchical access to
   * This includes direct permissions and inherited permissions from ancestor folders
   */
  filterByHierarchicalAccess(userId: string) {
    // For now, we'll use the simpler filterByUserAccess and rely on
    // the service layer's hasAncestorAccess method for detailed checking
    return this.filterByUserAccess(userId);
  }
}
