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
  CreateShareableLinkDto,
  UpdateFilePermissionDto,
  BulkShareDto,
} from '@keepcloud/commons/dtos';
import {
  FileNotFoundException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
import { nanoid } from 'nanoid';

@Injectable()
export class FileSharingService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly filePermissionRepository: FilePermissionRepository,
    private readonly fileLinkRepository: FileLinkRepository,
  ) {}

  /**
   * Share a file with a specific user (like Google Drive sharing)
   */
  private async shareFileWithUser(
    fileId: string,
    currentUserId: string,
    dto: ShareFileWithUserDto,
  ) {
    // Validate file and permissions
    await this.validateSharingPermissions(fileId, currentUserId);

    // Prevent self-sharing
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

  /**
   * Remove user access from a file
   */
  async removeUserAccess(
    fileId: string,
    userId: string,
    currentUserId: string,
  ): Promise<void> {
    // Validate file and permissions
    await this.validateSharingPermissions(fileId, currentUserId);

    const permission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterByUserId(userId)
      .getOne();

    if (!permission) {
      throw new NotFoundException({
        code: ErrorCode.PERMISSION_NOT_FOUND,
        message: 'User does not have access to this file',
      });
    }

    await this.filePermissionRepository.delete({ id: permission.id });
  }

  /**
   * Create a shareable link (like Google Drive link sharing)
   */
  async createShareableLink(
    fileId: string,
    currentUserId: string,
    dto: CreateShareableLinkDto,
  ) {
    // Validate file and permissions
    await this.validateSharingPermissions(fileId, currentUserId);

    // Generate unique token
    const token = nanoid(32);

    const link = await this.fileLinkRepository.create({
      file: { connect: { id: fileId } },
      token,
      role: dto.role || FilePermissionRole.VIEWER,
    });

    return this.getLinkDetails(link.id);
  }

  /**
   * Remove/delete a shareable link
   */
  async removeShareableLink(
    linkId: string,
    currentUserId: string,
  ): Promise<void> {
    const link = await this.fileLinkRepository.scoped
      .filterById(linkId)
      .joinFile()
      .getOne();

    if (!link) {
      throw new NotFoundException({
        code: ErrorCode.LINK_NOT_FOUND,
        message: 'Shareable link not found',
      });
    }

    // Validate permissions on the file
    await this.validateSharingPermissions(link.fileId, currentUserId);

    await this.fileLinkRepository.delete({ id: linkId });
  }

  /**
   * Get complete sharing information for a file
   */
  async getFileSharingInfo(fileId: string, currentUserId: string) {
    // Validate file exists and user has access
    await this.validateFileAccess(fileId, currentUserId);

    const [permissions, activeLinks] = await Promise.all([
      this.filePermissionRepository.scoped
        .filterByFileId(fileId)
        .joinUser()
        .joinGrantedBy()
        .getMany(),
      this.fileLinkRepository.scoped.filterByFileId(fileId).getMany(),
    ]);

    return {
      permissions: permissions,
      links: activeLinks,
      isShared: permissions.length > 0 || activeLinks.length > 0,
      totalSharedWith: permissions.length,
    };
  }

  /**
   * Bulk share file with multiple users at once
   */
  async bulkShareFile(
    fileId: string,
    currentUserId: string,
    dto: BulkShareDto,
  ) {
    // Validate file and permissions
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

    // If there were errors but some succeeded, we'll return the successes
    // The controller can handle reporting partial failures
    return results;
  }

  /**
   * Update permission role for an existing share
   */
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
          FilePermissionRole.TREE_OWNER,
        ] as FilePermissionRole[]
      ).includes(link.role),
    };
  }

  /**
   * Get files shared with a user
   */
  async getSharedWithUser(userId: string, page = 1, limit = 20) {
    return this.filePermissionRepository.scoped
      .filterByUserId(userId)
      .joinFile()
      .joinGrantedBy()
      .getManyPaginated(page, limit);
  }

  // Private helper methods

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
      (await this.hasMinimumRole(fileId, userId, FilePermissionRole.OWNER));

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
      [FilePermissionRole.COMMENTER]: 2,
      [FilePermissionRole.EDITOR]: 3,
      [FilePermissionRole.OWNER]: 4,
      [FilePermissionRole.TREE_OWNER]: 5,
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

  private async getLinkDetails(linkId: string) {
    return this.fileLinkRepository.scoped
      .filterById(linkId)
      .joinFile()
      .getOneOrFail();
  }
}
