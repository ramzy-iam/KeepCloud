import { Injectable } from '@nestjs/common';
import { BaseScope } from '../base';
import { SharedFile } from '../../entities';
// We'll create a basic scope without Prisma types for now
// since the Prisma client isn't generated due to network issues

@Injectable()
export class SharedFileScope extends BaseScope<
  SharedFile,
  any, // Prisma.SharedFileCreateInput,
  any, // Prisma.SharedFileUpdateInput,
  any, // Prisma.SharedFileWhereUniqueInput,
  any, // Prisma.SharedFileWhereInput,
  any, // Prisma.SharedFileInclude,
  any  // Prisma.SharedFileOrderByWithRelationInput
> {
  constructor(
    protected readonly prismaService: any,
    protected repository: any,
  ) {
    super(prismaService, repository);
  }

  filterByFileId(fileId: string) {
    this._where.fileId = fileId;
    return this;
  }

  filterBySharedWithId(userId: string) {
    this._where.sharedWithId = userId;
    return this;
  }

  filterByOwner(ownerId: string) {
    this._where.file = {
      ownerId: ownerId
    };
    return this;
  }

  includeFile() {
    this._include.file = {
      include: {
        owner: true
      }
    };
    return this;
  }

  includeSharedWith() {
    this._include.sharedWith = true;
    return this;
  }
}