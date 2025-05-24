import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType } from '@keepcloud/core/db';
import { CreateFileDto, PresignedPostResultDto } from '@keepcloud/commons/dtos';
import {
  FileKeyInvalidException,
  FileNotFoundException,
  FolderNotFoundException,
  InsufficientStorageException,
  S3Helper,
} from '@keepcloud/commons/backend';
import { Prisma } from '@prisma/client';
import { BaseFileService } from './base-file-service';
import { FileHelper } from '@keepcloud/commons/helpers';
import { UserService } from '../user';

@Injectable()
export class FileService extends BaseFileService {
  private readonly s3helper: S3Helper;
  private readonly bucket: string;

  constructor(
    protected override readonly fileRepository: FileRepository,
    private readonly userService: UserService,
  ) {
    super(fileRepository);
    this.s3helper = S3Helper.getInstance();
    this.bucket = process.env.FILE_BUCKET;
  }

  async create(ownerId: string, dto: CreateFileDto): Promise<File> {
    await this.validateParentFolder(dto.parentId);
    await this.validateFileExistsInStorage(dto.storagePath);

    const { name, format } = FileHelper.splitNameAndFormat(dto.filename);
    const filename = `${name}.${format}`;
    const size = await this.getFileSize(dto.storagePath);
    console.log({});

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

    await this.updateUserStorageAndMoveFile(
      ownerId,
      dto.storagePath,
      createdFile.id,
      filename,
    );

    return this.getOne(createdFile.id);
  }

  private async updateUserStorageAndMoveFile(
    ownerId: string,
    sourcePath: string,
    fileId: string,
    filename: string,
  ): Promise<void> {
    const destinationPath = this.generateStorageKey(ownerId, filename, fileId);
    await this.moveFileInStorage(
      `${this.bucket}/${sourcePath}`,
      destinationPath,
    );

    await this.fileRepository.update(
      { id: fileId },
      { storagePath: destinationPath },
    );

    await this.s3helper.deleteFile(this.bucket, sourcePath);
  }

  private async moveFileInStorage(
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
    return contentLength as number;
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

  private generateStorageKey(
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

  async getOne(id: string): Promise<File> {
    const file = await this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FILE)
      .joinOwner()
      .getOne();

    if (!file) throw new FileNotFoundException(id);
    return file;
  }
}
