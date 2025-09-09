import { Injectable } from '@nestjs/common';
import { FileLink, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { BaseScope } from '../base/base.scope';
import { FileLinkRepository } from './file-link.repository';

@Injectable()
export class FileLinkScope extends BaseScope<
  FileLink,
  Prisma.FileLinkCreateInput,
  Prisma.FileLinkUpdateInput,
  Prisma.FileLinkWhereUniqueInput,
  Prisma.FileLinkWhereInput,
  Prisma.FileLinkInclude,
  Prisma.FileLinkOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected repository: FileLinkRepository,
  ) {
    super(prismaService, repository);
  }

  filterByFileId(fileId: string) {
    this._where.fileId = fileId;
    return this;
  }

  filterByToken(token: string) {
    this._where.token = token;
    return this;
  }

  filterByRole(role: Prisma.EnumFilePermissionRoleFilter) {
    this._where.role = role;
    return this;
  }


 

  joinFile(): this {
    this._include.file = true;
    return this;
  }
}
