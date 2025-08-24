import { Injectable } from '@nestjs/common';
import { File, FileRepository, FileType, Prisma } from '@keepcloud/core/db';
import {
  CreateFileDto,
  FileAncestorDto,
  PresignedGetResultDto,
} from '@keepcloud/commons/dtos';
import {
  AppConfigService,
  FileKeyInvalidException,
  FileNotFoundException,
  FolderNotFoundException,
  InsufficientStorageException,
  InternalServerErrorException,
  Logger,
  S3Helper,
} from '@keepcloud/commons/backend';
import { BaseFileService } from './base-file-service';
import { FileHelper } from '@keepcloud/commons/helpers';
import { UserService } from '../user';
import { FileUploadStatus, SYSTEM_FILE } from '@keepcloud/commons/constants';
import { SystemQueueService } from '../queues';
import { DispositionType } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';

@Injectable()
export class FileService extends BaseFileService {
  protected readonly s3helper: S3Helper;
  protected readonly bucket: string;
  protected logger: Logger;

  constructor(
    protected override readonly fileRepository: FileRepository,
    private readonly userService: UserService,
    private readonly systemQueueService: SystemQueueService,
    protected override readonly nestedSetService: NestedSetService,
    protected readonly configService: AppConfigService,
  ) {
    super(fileRepository, nestedSetService);
    this.s3helper = S3Helper.getInstance();
    this.bucket = this.configService.env.FILE_BUCKET;
    this.logger = new Logger(FileService.name);
  }

  async create(
    ownerId: string,
    dto: CreateFileDto,
  ): Promise<File & { ancestors: FileAncestorDto[] }> {
    let parentId = dto.parentId || null;
    if (!parentId || FileHelper.isSystemFile(parentId)) {
      const root = await this.fileRepository.getRootFolder();
      parentId = root.id;
    }

    await this.validateParentFolder(parentId);
    await this.validateFileExistsInStorage(dto.storagePath);

    const { name, format } = FileHelper.splitNameAndFormat(dto.filename);
    const filename = `${name}.${format}`;
    const size = await this.getFileSize(dto.storagePath);

    await this.checkUserStorageLimit(ownerId, size);

    const createdFile = await this.fileRepository.prisma.$transaction(
      async (tx) => {
        const { left, right } =
          await this.nestedSetService.allocateNestedSetPosition(
            ownerId,
            parentId,
            tx,
          );

        const fileData: Prisma.FileCreateInput = {
          name: filename,
          owner: { connect: { id: ownerId } },
          contentType: FileHelper.getContentType(dto.storagePath),
          size,
          type: FileType.FILE,
          storagePath: dto.storagePath,
          format,
          isSystem: false,
          left,
          right,
          parent: { connect: { id: parentId } },
          children: { connect: [] },
        };

        const file = await tx.file.create({ data: fileData });

        return file;
      },
    );

    await this.userService.updateStorageUsed(ownerId, size);
    await this.systemQueueService.enqueueUpdateFileTagInStorage({
      ownerId,
      sourcePath: dto.storagePath,
      fileId: createdFile.id,
    });

    return this.getOne(ownerId, createdFile.id);
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

  async getPresignedPost(userId: string, filename: string) {
    const key = this.generateStorageKey(userId, filename);
    return this.s3helper.createPresignedPost(this.bucket, key, {
      tags: {
        upload: FileUploadStatus.PENDING,
      },
    });
  }

  private async getPresignedGet(
    fileId: string,
    disposition: DispositionType = 'inline',
    customFilename?: string,
  ): Promise<string> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .getOneOrFail();

    if (!file.storagePath) {
      throw new InternalServerErrorException();
    }

    const fileFormat = file.format;
    const filename = customFilename || file.name;

    let finalFilename = filename;

    if (fileFormat) {
      const extRegex = /\.([a-zA-Z0-9]+)$/;
      const match = extRegex.exec(filename);
      const currentExt = match?.[1]?.toLowerCase();

      if (!currentExt || currentExt !== fileFormat.toLowerCase()) {
        finalFilename += `.${fileFormat}`;
      }
    }

    const contentDisposition = `${disposition}; filename="${finalFilename}"`;

    return this.s3helper.createPresignedGet(file.storagePath, {
      bucket: this.bucket,
      contentDisposition,
    });
  }

  async generatePresignedGet(
    userId: string,
    id: string,
  ): Promise<PresignedGetResultDto> {
    await this.getOne(id, userId); // Ensure the file exists and belongs to the user
    return {
      previewUrl: await this.getPresignedGet(id, 'inline'),
      downloadUrl: await this.getPresignedGet(id, 'attachment'),
    };
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
    if (remainingStorage < BigInt(size)) {
      throw new InsufficientStorageException();
    }
  }

  protected generateStorageKey(
    userId: string,
    filename: string,
    fileId?: string,
  ): string {
    const sanitizedFilename = this.sanitizeFilename(filename);

    if (fileId) {
      return `user-${userId}/${fileId}_${sanitizedFilename}`;
    }

    const timestamp = Date.now();

    return `user-${userId}/${timestamp}_${sanitizedFilename}`;
  }

  private sanitizeFilename(filename: string): string {
    const parts = filename.split('.');
    const hasExtension = parts.length > 1;

    const baseName = hasExtension ? parts.slice(0, -1).join('.') : filename;
    const extension = hasExtension ? '.' + parts.at(-1) : '';

    const slugified = baseName
      .normalize('NFKD') // Normalize accents
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/[\s_-]+/g, '_') // Replace spaces/dashes with _
      .toLowerCase();

    return (slugified + extension).slice(0, 255);
  }

  async getOne(
    userId: string,
    id: string,
  ): Promise<File & { ancestors: FileAncestorDto[] }> {
    const scope = this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FILE)
      .joinOwner()
      .filterByOwnerId(userId);

    const file = await scope.getOne();

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
