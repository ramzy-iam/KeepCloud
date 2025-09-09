import { Injectable } from '@nestjs/common';
import { FilePermission, Prisma } from '@prisma/client';
import { BaseRepository } from '../base';
import { PrismaService } from '../../prisma';
import { FilePermissionScope } from './file-permission.scope';

@Injectable()
export class FilePermissionRepository extends BaseRepository<
  FilePermission,
  Prisma.FilePermissionCreateInput,
  Prisma.FilePermissionUpdateInput,
  Prisma.FilePermissionWhereUniqueInput,
  Prisma.FilePermissionWhereInput,
  Prisma.FilePermissionInclude,
  Prisma.FilePermissionOrderByWithRelationInput
> {
  constructor(protected readonly prismaService: PrismaService) {
    super('filePermission', prismaService);
  }

  get scoped(): FilePermissionScope {
    return new FilePermissionScope(this.prismaService, this);
  }
}
