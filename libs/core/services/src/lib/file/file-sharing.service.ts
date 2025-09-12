import { Injectable } from '@nestjs/common';
import {
  FileRepository,
  FilePermissionRepository,
  FileLinkRepository,
  File,
  FilePermission,
  FileLink,
  FilePermissionRole,
} from '@keepcloud/core/db';
import {
  ShareFileWithUserDto,
  UpdateFilePermissionDto,
  ShareFileDto,
} from '@keepcloud/commons/dtos';
import {
  FileNotFoundException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';

@Injectable()
export class FileSharingService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly filePermissionRepository: FilePermissionRepository,
    private readonly fileLinkRepository: FileLinkRepository,
  ) {}

  private async shareFileWithUser(
    fileId: string,
    currentUserId: string,
    dto: ShareFileWithUserDto,
  ) {
    await this.validateSharingPermissions(fileId, currentUserId);

    if (dto.userId === currentUserId) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_INPUT,
        message: 'Cannot share file with yourself',
      });
    }

    // Check if permission already exists
    const existingPermission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterByUserId(dto.userId)
      .getOne();

    if (existingPermission) {
      // Update existing permission
      const updated = await this.filePermissionRepository.update(
        { id: existingPermission.id },
        { role: dto.role },
      );
      return this.getPermissionDetails(updated.id);
    }

    // Create new permission
    const permission = await this.filePermissionRepository.create({
      file: { connect: { id: fileId } },
      user: { connect: { id: dto.userId } },
      grantedBy: { connect: { id: currentUserId } },
      role: dto.role,
    });

    return this.getPermissionDetails(permission.id);
  }

  async revokePermission(
    fileId: string,
    permissionId: string,
    currentUserId: string,
  ): Promise<void> {
    await this.validateSharingPermissions(fileId, currentUserId);

    const permission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterById(permissionId)
      .getOne();

    if (!permission) {
      throw new NotFoundException({
        code: ErrorCode.PERMISSION_NOT_FOUND,
        message: 'User does not have access to this file',
      });
    }

    await this.filePermissionRepository.delete({ id: permission.id });
  }

  async shareFile(fileId: string, currentUserId: string, dto: ShareFileDto) {
    await this.validateSharingPermissions(fileId, currentUserId);

    const results: FilePermission[] = [];
    const errors: string[] = [];

    for (const userId of dto.userIds) {
      try {
        if (userId === currentUserId) {
          errors.push(`Cannot share with yourself`);
          continue;
        }

        const permission = await this.shareFileWithUser(fileId, currentUserId, {
          userId,
          role: dto.role,
        });
        results.push(permission);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to share with user ${userId}: ${message}`);
      }
    }

    return results;
  }

  async updatePermissionRole(
    permissionId: string,
    currentUserId: string,
    dto: UpdateFilePermissionDto,
  ) {
    const permission = await this.filePermissionRepository.scoped
      .filterById(permissionId)
      .joinFile()
      .getOne();

    if (!permission) {
      throw new NotFoundException({
        code: ErrorCode.PERMISSION_NOT_FOUND,
        message: 'Permission not found',
      });
    }

    // Validate permissions on the file
    await this.validateSharingPermissions(permission.fileId, currentUserId);

    const updated = await this.filePermissionRepository.update(
      { id: permissionId },
      { role: dto.role },
    );

    return this.getPermissionDetails(updated.id);
  }

  /**
   * Access file via shareable link (public endpoint)
   */
  async accessFileByLink(token: string): Promise<{
    file: File;
    link: FileLink;
    canView: boolean;
    canEdit: boolean;
  }> {
    const link = await this.fileLinkRepository.scoped
      .filterByToken(token)
      .joinFile()
      .getOne();

    if (!link) {
      throw new NotFoundException({
        code: ErrorCode.LINK_NOT_FOUND,
        message: 'Invalid or expired link',
      });
    }

    // Check if file still exists and is not trashed
    const file = await this.fileRepository.scoped
      .filterById(link.fileId)
      .filterByNotTrashed()
      .getOne();

    if (!file) {
      throw new NotFoundException({
        code: ErrorCode.FILE_NOT_FOUND,
        message: 'File not found or has been deleted',
      });
    }

    return {
      file,
      link,
      canView: true,
      canEdit: (
        [
          FilePermissionRole.EDITOR,
          FilePermissionRole.OWNER,
        ] as FilePermissionRole[]
      ).includes(link.role),
    };
  }

  private async validateSharingPermissions(
    fileId: string,
    userId: string,
  ): Promise<File> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByNotTrashed()
      .getOne();

    if (!file) {
      throw new FileNotFoundException(fileId);
    }

    // Check if user is owner or has sharing permissions
    const canShare =
      file.ownerId === userId ||
      file.treeOwnerId === userId ||
      (await this.hasMinimumRole(fileId, userId, FilePermissionRole.EDITOR));

    if (!canShare) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'You do not have permission to share this file',
      });
    }

    return file;
  }

  private async validateFileAccess(
    fileId: string,
    userId: string,
  ): Promise<File> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByNotTrashed()
      .getOne();

    if (!file) {
      throw new FileNotFoundException(fileId);
    }

    // Check if user has any access to the file
    const hasAccess =
      file.ownerId === userId ||
      file.treeOwnerId === userId ||
      (await this.hasAnyPermission(fileId, userId));

    if (!hasAccess) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'You do not have access to this file',
      });
    }

    return file;
  }

  private async hasMinimumRole(
    fileId: string,
    userId: string,
    minimumRole: FilePermissionRole,
  ): Promise<boolean> {
    const permission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterByUserId(userId)
      .getOne();

    if (!permission) return false;

    const roleHierarchy = {
      [FilePermissionRole.VIEWER]: 1,
      [FilePermissionRole.EDITOR]: 2,
      [FilePermissionRole.OWNER]: 3,
    };

    return roleHierarchy[permission.role] >= roleHierarchy[minimumRole];
  }

  private async hasAnyPermission(
    fileId: string,
    userId: string,
  ): Promise<boolean> {
    const permission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterByUserId(userId)
      .getOne();

    return !!permission;
  }

  private async getPermissionDetails(permissionId: string) {
    return this.filePermissionRepository.scoped
      .filterById(permissionId)
      .joinUser()
      .joinGrantedBy()
      .joinFile()
      .getOneOrFail();
  }
}
