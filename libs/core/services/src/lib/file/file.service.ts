import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import {
  CreateFileDto,
  FileAncestorDto,
  PresignedPostResultDto,
} from '@keepcloud/commons/dtos';
import {
  FileKeyInvalidException,
  FileNotFoundException,
  FolderNotFoundException,
  InsufficientStorageException,
  InternalServerErrorException,
  Logger,
  S3Helper,
} from '@keepcloud/commons/backend';
import { Prisma } from '@prisma/client';
import { BaseFileService } from './base-file-service';
import { FileHelper } from '@keepcloud/commons/helpers';
import { UserService } from '../user';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { SystemQueueService } from '../queues';
import { DispositionType } from '@keepcloud/commons/types';

@Injectable()
export class FileService extends BaseFileService {
  protected readonly s3helper: S3Helper;
  protected readonly bucket: string;
  protected logger: Logger;

  constructor(
    protected override readonly fileRepository: FileRepository,
    private readonly userService: UserService,
    private readonly systemQueueService: SystemQueueService,
  ) {
    super(fileRepository);
    this.s3helper = S3Helper.getInstance();
    this.bucket = process.env.FILE_BUCKET;
    this.logger = new Logger(FileService.name);
  }

  async create(
    ownerId: string,
    dto: CreateFileDto,
  ): Promise<File & { ancestors: FileAncestorDto[] }> {
    await this.validateParentFolder(dto.parentId);
    await this.validateFileExistsInStorage(dto.storagePath);

    const { name, format } = FileHelper.splitNameAndFormat(dto.filename);
    const filename = `${name}.${format}`;
    const size = await this.getFileSize(dto.storagePath);

    await this.checkUserStorageLimit(ownerId, size);

    const fileData = this.buildFileCreateInput(
      ownerId,
      filename,
      format,
      dto,
      size,
    );
    const createdFile = await this.fileRepository.create({
      ...fileData,
      storagePath: dto.storagePath,
    });

    await this.userService.updateStorageUsed(ownerId, size);

    await this.systemQueueService.moveFileInStorageAfterCreate({
      ownerId,
      sourcePath: dto.storagePath,
      fileId: createdFile.id,
      filename,
    });

    return this.getOne(createdFile.id);
  }

  protected async moveFileInStorage(
    sourcePath: string,
    destinationPath: string,
  ): Promise<void> {
    const response = await this.s3helper.copyFile(
      this.bucket,
      destinationPath,
      sourcePath,
    );

    if (!response) {
      throw new FileKeyInvalidException(sourcePath);
    }
  }

  async getPresignedPost(
    userId: string,
    filename: string,
  ): Promise<PresignedPostResultDto> {
    const key = this.generateStorageKey(userId, filename);
    return this.s3helper.createPresignedPost(this.bucket, key);
  }

  async getPresignedGet(
    fileId: string,
    disposition: DispositionType = 'inline',
  ): Promise<string> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .getOneOrFail();
    if (file.storagePath)
      return this.s3helper.createPresignedGet(file.storagePath, {
        bucket: this.bucket,
        contentDisposition: disposition,
      });

    throw new InternalServerErrorException();
  }

  private async validateParentFolder(parentId?: string | null): Promise<void> {
    if (!parentId) return;

    const parent = await this.fileRepository.scoped
      .filterById(parentId)
      .filerByIsFolder()
      .getOne();

    if (!parent) {
      throw new FolderNotFoundException(parentId);
    }
  }

  private async validateFileExistsInStorage(
    storagePath: string,
  ): Promise<void> {
    const fileExists = await this.s3helper.fileExists(this.bucket, storagePath);
    if (!fileExists) {
      throw new FileKeyInvalidException(storagePath);
    }
  }

  private async getFileSize(storagePath: string): Promise<number> {
    const { contentLength } = await this.s3helper.getFileMetadata(
      this.bucket,
      storagePath,
    );
    if (typeof contentLength === 'undefined') {
      this.logger.error('The file size is undefined');
      throw new InternalServerErrorException();
    }
    return contentLength;
  }

  private async checkUserStorageLimit(
    ownerId: string,
    size: number,
  ): Promise<void> {
    const remainingStorage =
      await this.userService.getRemainingStorage(ownerId);
    if (remainingStorage < size) {
      throw new InsufficientStorageException();
    }
  }

  private buildFileCreateInput(
    ownerId: string,
    name: string,
    format: string,
    dto: CreateFileDto,
    size: number,
  ): Prisma.FileCreateInput {
    return {
      name,
      owner: { connect: { id: ownerId } },
      contentType: FileHelper.getContentType(dto.storagePath),
      size,
      type: FileType.FILE,
      storagePath: null,
      format,
      isSystem: false,
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      children: { connect: [] },
    };
  }

  protected generateStorageKey(
    userId: string,
    filename: string,
    fileId?: string,
  ): string {
    if (fileId) {
      return `user-${userId}/${fileId}_${filename}`;
    }
    const timestamp = Date.now();
    return `user-${userId}/tmp/${timestamp}_${filename}`;
  }

  async getOne(id: string): Promise<File & { ancestors: FileAncestorDto[] }> {
    const file = await this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FILE)
      .joinOwner()
      .getOne();

    if (!file) throw new FileNotFoundException(id);

    let ancestors: FileAncestorDto[] = [];
    ancestors = await this.fileRepository.getAncestors(id);

    return {
      ...file,
      ancestors: [
        {
          id: SYSTEM_FILE.MY_STORAGE.id,
          name: SYSTEM_FILE.MY_STORAGE.name,
          code: SYSTEM_FILE.MY_STORAGE.code,
          isSystem: true,
        },
        ...ancestors,
      ],
    };
  }
}
