import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType, Prisma } from '@keepcloud/core/db';
import { CreateFolderDto } from '@keepcloud/commons/dtos';
import { BadRequestException } from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async createFolder(dto: CreateFolderDto): Promise<File> {
    if (dto.parentId) {
      const parent = await this.fileRepository.findOne({ id: dto.parentId });
      if (dto.parentId && (!parent || parent.type !== FileType.FOLDER)) {
        throw new BadRequestException(
          ErrorCode.INVALID_PARENT_FOLDER,
          'Parent must be a valid folder',
          'parentId',
        );
      }
    }

    const existingFolder = await this.fileRepository.findOne({
      name: dto.name,
      parentId: dto.parentId,
    });
    if (existingFolder) {
      throw new BadRequestException(
        ErrorCode.FILE_ALREADY_EXISTS,
        `A folder named "${dto.name}" already exists in this folder`,
        'name',
      );
    }

    const folderData: Prisma.FileCreateInput = {
      name: dto.name,
      owner: { connect: { id: '1' } },
      contentType: 'folder',
      size: BigInt(0),
      type: FileType.FOLDER,
      storagePath: null,
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      children: { connect: [] },
    };

    return this.fileRepository.create(folderData);
  }
}
