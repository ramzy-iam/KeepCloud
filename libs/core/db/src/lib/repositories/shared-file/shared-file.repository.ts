import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { SharedFile } from '../../entities';
import { BaseRepository } from '../base';
import { SharedFileScope } from './shared-file.scope';

@Injectable()
export class SharedFileRepository extends BaseRepository<
  SharedFile,
  any, // Prisma.SharedFileCreateInput,
  any, // Prisma.SharedFileUpdateInput,
  any, // Prisma.SharedFileWhereUniqueInput,
  any, // Prisma.SharedFileWhereInput,
  any, // Prisma.SharedFileInclude,
  any  // Prisma.SharedFileOrderByWithRelationInput
> {
  constructor(protected readonly prismaService: PrismaService) {
    super('sharedFile');
  }

  get scoped(): SharedFileScope {
    return new SharedFileScope(this.prismaService, this);
  }

  async findByFileIdAndUserId(fileId: string, userId: string): Promise<SharedFile | null> {
    return this.prismaService.sharedFile.findFirst({
      where: {
        fileId: fileId,
        sharedWithId: userId,
        deletedAt: null,
      },
      include: {
        file: {
          include: {
            owner: true
          }
        },
        sharedWith: true
      }
    });
  }

  async findByFileId(fileId: string): Promise<SharedFile[]> {
    return this.prismaService.sharedFile.findMany({
      where: {
        fileId: fileId,
        deletedAt: null,
      },
      include: {
        file: {
          include: {
            owner: true
          }
        },
        sharedWith: true
      }
    });
  }

  async findSharedWithUser(userId: string): Promise<SharedFile[]> {
    return this.prismaService.sharedFile.findMany({
      where: {
        sharedWithId: userId,
        deletedAt: null,
      },
      include: {
        file: {
          include: {
            owner: true
          }
        },
        sharedWith: true
      }
    });
  }
}