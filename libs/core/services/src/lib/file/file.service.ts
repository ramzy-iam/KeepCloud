import { Injectable } from '@nestjs/common';
import {
  File,
  FileRepository,
  FileType,
  Prisma,
  FilePermissionRole,
} from '@keepcloud/core/db';
import {
  CreateFileDto,
  FileAncestorDto,
  PresignedGetResultDto,
} from '@keepcloud/commons/dtos';
import * as qs from 'querystring'; // or use encodeURIComponent
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
import { FileHelper } from '@keepcloud/commons/helpers';
import { UserService } from '../user';
import { FileUploadStatus, SYSTEM_FILE } from '@keepcloud/commons/constants';
import { SystemQueueService } from '../queues';
import { DispositionType } from '@keepcloud/commons/types';
import { NestedSetService } from '../storage';
import { FilePermissionService } from './file-permission.service';

@Injectable()
export class FileService {
  protected readonly s3helper: S3Helper;
  protected readonly bucket: string;
  protected logger: Logger;

  constructor(
    protected readonly fileRepository: FileRepository,
    protected readonly nestedSetService: NestedSetService,
    protected readonly queueService: SystemQueueService,
    protected readonly userService: UserService,
    protected readonly configService: AppConfigService,
    protected readonly filePermissionService: FilePermissionService,
  ) {
    this.s3helper = S3Helper.getInstance();
    this.bucket = this.configService.env.FILE_BUCKET;
    this.logger = new Logger(FileService.name);
  }

  async create(
    ownerId: string,
    dto: CreateFileDto,
  ): Promise<File & { ancestors: FileAncestorDto[] }> {
    let parentId = dto.parentId || null;
    let parent: File | null = null;
    if (!parentId || FileHelper.isSystemFile(parentId)) {
      const root = await this.fileRepository.getRootFolder(ownerId);
      parentId = root.id;
      parent = root;
    }

    // Verify user has EDITOR role or higher on the parent folder
    await this.filePermissionService.verifyUserRole(
      parentId,
      ownerId,
      FilePermissionRole.EDITOR,
    );

    parent = await this.validateParentFolder(parentId);
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
          treeOwner: { connect: { id: parent?.treeOwnerId } },
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
    const treeOwnerId = createdFile.treeOwnerId;

    // Create inherited permission for tree owner if file is created in a shared folder
    await this.filePermissionService.createInheritedPermissionForTreeOwner(
      createdFile.id,
      ownerId,
    );

    await this.userService.updateStorageUsed(treeOwnerId, size);
    await this.queueService.enqueueUpdateFileTagInStorage({
      treeOwnerId,
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

  buildContentDisposition(disposition: string, filename: string): string {
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_');
    const utf8Filename = encodeURIComponent(filename);

    return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${utf8Filename}`;
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

    const contentDisposition = this.buildContentDisposition(
      disposition,
      finalFilename,
    );

    return this.s3helper.createPresignedGet(file.storagePath, {
      bucket: this.bucket,
      contentDisposition,
    });
  }

  async generatePresignedGet(
    userId: string,
    id: string,
  ): Promise<PresignedGetResultDto> {
    await this.getOne(userId, id); // Ensure the file exists and belongs to the user
    return {
      previewUrl: await this.getPresignedGet(id, 'inline'),
      downloadUrl: await this.getPresignedGet(id, 'attachment'),
    };
  }

  private async validateParentFolder(
    parentId?: string | null,
  ): Promise<File | null> {
    if (!parentId) return null;

    const parent = await this.fileRepository.scoped
      .filterById(parentId)
      .filerByIsFolder()
      .getOne();

    if (!parent) {
      throw new FolderNotFoundException(parentId);
    }
    return parent;
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
    const extension = hasExtension
      ? '.' + (parts.at(-1) as string).toLowerCase()
      : '';

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
    // First check if user has access through direct permissions or ancestor permissions
    const hasAccess = await this.fileRepository.hasAncestorAccess(id, userId);

    if (!hasAccess) {
      throw new FileNotFoundException(id);
    }

    await this.filePermissionService.checkAndThrowIfTrashed(id);

    const scope = this.fileRepository.scoped
      .filterById(id)
      .filterByType(FileType.FILE)
      .filterByNotTrashed()
      .joinOwner()
      .joinPermissions();

    const file = await scope.getOne();

    if (!file) throw new FileNotFoundException(id);

    // Check if this file is shared with the user (not owned by them)
    const isSharedWithUser = file.treeOwnerId !== userId;

    let ancestors: FileAncestorDto[] = [];
    if (isSharedWithUser) {
      // For shared files, only load ancestors up to where user has access
      const hasDirectPermission =
        await this.filePermissionService.hasDirectPermission(id, userId);
      if (hasDirectPermission) {
        // User has direct permission on this file, don't load ancestors
        ancestors = [];
      } else {
        // Load ancestors only up to the folder where user has direct access
        const accessibleAncestorIds =
          await this.filePermissionService.getAccessibleAncestors(id, userId);
        if (accessibleAncestorIds.length > 0) {
          // Get ancestor details for accessible ancestors only
          const accessibleAncestors =
            await this.fileRepository.prisma.file.findMany({
              where: { id: { in: accessibleAncestorIds } },
              select: { id: true, name: true, left: true },
              orderBy: { left: 'asc' },
            });
          ancestors = accessibleAncestors.map((a) => ({
            id: a.id,
            name: a.name,
          }));
        }
      }
    } else {
      // Not shared, load all ancestors normally
      ancestors = await this.fileRepository.getAncestors(id);
    }

    return {
      ...file,
      ancestors: [
        {
          id: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.id
            : SYSTEM_FILE.MY_STORAGE.id,
          name: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.name
            : SYSTEM_FILE.MY_STORAGE.name,
          code: isSharedWithUser
            ? SYSTEM_FILE.SHARED_WITH_ME.code
            : SYSTEM_FILE.MY_STORAGE.code,
          isSystem: true,
        },
        ...ancestors,
      ],
    };
  }
}
