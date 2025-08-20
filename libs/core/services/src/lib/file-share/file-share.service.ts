import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { SharedFileRepository, FileRepository, UserRepository } from '@keepcloud/core/db';
import { 
  CreateFileShareDto, 
  UpdateFileShareDto, 
  FileShareResponseDto, 
  ShareFileWithUserDto,
  PermissionType 
} from '@keepcloud/commons/dtos';
import { ErrorCode } from '@keepcloud/commons/constants';

@Injectable()
export class FileShareService {
  constructor(
    private readonly sharedFileRepository: SharedFileRepository,
    private readonly fileRepository: FileRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async shareFile(ownerId: string, dto: CreateFileShareDto): Promise<FileShareResponseDto> {
    // Verify the file exists and user owns it
    const file = await this.fileRepository.scoped
      .filterById(dto.fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException({
        message: ErrorCode.FILE_NOT_FOUND,
      });
    }

    // Find user by email
    const targetUser = await this.userRepository.scoped
      .filterByEmail(dto.sharedWithEmail)
      .getOne();

    if (!targetUser) {
      throw new NotFoundException({
        message: ErrorCode.USER_NOT_FOUND,
      });
    }

    // Check if file is already shared with this user
    const existingShare = await this.sharedFileRepository.findByFileIdAndUserId(
      dto.fileId,
      targetUser.id
    );

    if (existingShare) {
      throw new ConflictException({
        message: 'File is already shared with this user',
      });
    }

    // Create the share
    const sharedFile = await this.sharedFileRepository.create({
      fileId: dto.fileId,
      sharedWithId: targetUser.id,
      permission: dto.permission || PermissionType.VIEW,
    });

    return this.mapToResponseDto(sharedFile);
  }

  async shareFileWithUser(ownerId: string, fileId: string, dto: ShareFileWithUserDto): Promise<FileShareResponseDto> {
    // Verify the file exists and user owns it
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException({
        message: ErrorCode.FILE_NOT_FOUND,
      });
    }

    // Verify target user exists
    const targetUser = await this.userRepository.scoped
      .filterById(dto.userId)
      .getOne();

    if (!targetUser) {
      throw new NotFoundException({
        message: ErrorCode.USER_NOT_FOUND,
      });
    }

    // Check if file is already shared with this user
    const existingShare = await this.sharedFileRepository.findByFileIdAndUserId(
      fileId,
      dto.userId
    );

    if (existingShare) {
      throw new ConflictException({
        message: 'File is already shared with this user',
      });
    }

    // Create the share
    const sharedFile = await this.sharedFileRepository.create({
      fileId: fileId,
      sharedWithId: dto.userId,
      permission: dto.permission || PermissionType.VIEW,
    });

    return this.mapToResponseDto(sharedFile);
  }

  async updateFileShare(ownerId: string, shareId: string, dto: UpdateFileShareDto): Promise<FileShareResponseDto> {
    // Find the share and verify ownership
    const share = await this.sharedFileRepository.scoped
      .filterById(shareId)
      .includeFile()
      .getOne();

    if (!share) {
      throw new NotFoundException({
        message: 'File share not found',
      });
    }

    // Verify the file owner
    if (share.file?.ownerId !== ownerId) {
      throw new ForbiddenException({
        message: ErrorCode.FORBIDDEN,
      });
    }

    // Update the share
    const updatedShare = await this.sharedFileRepository.update(
      { id: shareId },
      { permission: dto.permission }
    );

    return this.mapToResponseDto(updatedShare);
  }

  async deleteFileShare(ownerId: string, shareId: string): Promise<void> {
    // Find the share and verify ownership
    const share = await this.sharedFileRepository.scoped
      .filterById(shareId)
      .includeFile()
      .getOne();

    if (!share) {
      throw new NotFoundException({
        message: 'File share not found',
      });
    }

    // Verify the file owner
    if (share.file?.ownerId !== ownerId) {
      throw new ForbiddenException({
        message: ErrorCode.FORBIDDEN,
      });
    }

    // Soft delete the share
    await this.sharedFileRepository.update(
      { id: shareId },
      { deletedAt: new Date() }
    );
  }

  async getFileShares(ownerId: string, fileId: string): Promise<FileShareResponseDto[]> {
    // Verify the file exists and user owns it
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException({
        message: ErrorCode.FILE_NOT_FOUND,
      });
    }

    const shares = await this.sharedFileRepository.findByFileId(fileId);
    return shares.map(share => this.mapToResponseDto(share));
  }

  async getSharedWithMe(userId: string): Promise<FileShareResponseDto[]> {
    const shares = await this.sharedFileRepository.findSharedWithUser(userId);
    return shares.map(share => this.mapToResponseDto(share));
  }

  async hasFileAccess(fileId: string, userId: string): Promise<boolean> {
    // Check if user owns the file
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(userId)
      .getOne();

    if (file) {
      return true;
    }

    // Check if file is shared with user
    const share = await this.sharedFileRepository.findByFileIdAndUserId(fileId, userId);
    return !!share;
  }

  async getFilePermission(fileId: string, userId: string): Promise<PermissionType | null> {
    // Check if user owns the file (full access)
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(userId)
      .getOne();

    if (file) {
      return PermissionType.EDIT; // Owner has edit permission
    }

    // Check shared permission
    const share = await this.sharedFileRepository.findByFileIdAndUserId(fileId, userId);
    return share ? (share.permission as PermissionType) : null;
  }

  private mapToResponseDto(sharedFile: any): FileShareResponseDto {
    return {
      id: sharedFile.id,
      createdAt: sharedFile.createdAt,
      updatedAt: sharedFile.updatedAt,
      fileId: sharedFile.fileId,
      file: sharedFile.file ? {
        id: sharedFile.file.id,
        name: sharedFile.file.name,
        isFolder: sharedFile.file.isFolder,
        size: sharedFile.file.size,
        contentType: sharedFile.file.contentType,
        createdAt: sharedFile.file.createdAt,
        updatedAt: sharedFile.file.updatedAt,
        owner: sharedFile.file.owner
      } : undefined,
      sharedWithId: sharedFile.sharedWithId,
      sharedWith: sharedFile.sharedWith,
      permission: sharedFile.permission as PermissionType,
    };
  }
}