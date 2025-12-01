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
  UpdateFilePermissionDto,
  ShareFileDto,
  ShareFilePublicDto,
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

  private async _shareFileWithUser(
    fileId: string,
    currentUserId: string,
    userId: string | null,
    role: FilePermissionRole,
    isInherited = false,
    parentPermissionId?: string | null,
  ) {
    await this.validateSharingPermissions(fileId, currentUserId);

    if (userId === currentUserId) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_INPUT,
        message: 'Cannot share file with yourself',
      });
    }

    // Check if permission already exists
    const existingPermission = await this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .filterByUserId(userId)
      .getOne();
    if (existingPermission) {
      // Update existing permission
      const updated = await this.filePermissionRepository.update(
        { id: existingPermission.id },
        { role, isInherited },
      );
      return this.getPermissionDetails(updated.id);
    }

    // Create new permission
    const permission = await this.filePermissionRepository.create({
      file: { connect: { id: fileId } },
      ...(userId ? { user: { connect: { id: userId } } } : {}),
      grantedBy: { connect: { id: currentUserId } },
      role,
      isInherited,
      inheritedFrom: parentPermissionId
        ? { connect: { id: parentPermissionId } }
        : undefined,
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
    const file = await this.validateSharingPermissions(fileId, currentUserId);

    // Check if it's a folder and apply recursive sharing automatically
    if (file.type === 'FOLDER') {
      return this.shareFolderRecursively(fileId, currentUserId, dto);
    }

    // Handle regular file sharing
    const results: FilePermission[] = [];
    const errors: string[] = [];

    for (const userId of dto.userIds) {
      try {
        if (userId === currentUserId) {
          errors.push(`Cannot share with yourself`);
          continue;
        }

        const permission = await this._shareFileWithUser(
          fileId,
          currentUserId,
          userId,
          dto.role,
        );
        results.push(permission);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to share with user ${userId}: ${message}`);
      }
    }
    return;
    // return { results, errors };
  }

  async shareFilePublic(
    fileId: string,
    currentUserId: string,
    dto: ShareFilePublicDto,
  ) {
    await this.validateSharingPermissions(fileId, currentUserId);
    await this._shareFileWithUser(fileId, currentUserId, null, dto.role);
    return { message: 'File shared publicly successfully' };
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

    await this.filePermissionRepository.update(
      { id: permissionId },
      { role: dto.role },
    );
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
    const permission = (await this.filePermissionRepository.scoped
      .filterById(permissionId)
      .joinUser()
      .joinGrantedBy()
      .joinFile()
      .getOneOrFail()) as FilePermission & { file: File };

    return {
      ...permission,
      file: permission.file
        ? {
            id: permission.file.id,
            name: permission.file.name,
            type: permission.file.type,
          }
        : undefined,
    };
  }

  /**
   * Get list of collaborators for a file
   */
  async getFilePermissions(
    fileId: string,
    currentUserId: string,
  ): Promise<FilePermission[]> {
    await this.validateFileAccess(fileId, currentUserId);

    return this.filePermissionRepository.scoped
      .filterByFileId(fileId)
      .joinUser()
      .joinGrantedBy()
      .getMany();
  }

  /**
   * Remove collaborator from file
   */
  async removeCollaborator(
    fileId: string,
    userId: string,
    currentUserId: string,
  ): Promise<void> {
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

    // Remove the main permission
    await this.filePermissionRepository.delete({ id: permission.id });

    // If this was a folder permission, also remove inherited permissions from descendants
    const file = await this.fileRepository.scoped.filterById(fileId).getOne();

    if (file && file.type === 'FOLDER') {
      await this.removeInheritedPermissions(fileId, userId);
    }
  }

  /**
   * Share folder recursively (applies permissions to all children)
   */
  private async shareFolderRecursively(
    folderId: string,
    currentUserId: string,
    dto: ShareFileDto,
  ) {
    // Get folder info (validation already done in shareFile method)
    const folder = await this.fileRepository.scoped
      .filterById(folderId)
      .filterByNotTrashed()
      .getOneOrFail();

    // Share the folder itself with all users
    const folderPermissions = [];
    for (const userId of dto.userIds) {
      try {
        const permission = await this._shareFileWithUser(
          folderId,
          currentUserId,
          userId,
          dto.role,
        );
        folderPermissions.push(permission);
      } catch (error) {
        console.error(`Failed to share folder with user ${userId}:`, error);
      }
    }

    // Get all descendants of this folder using nested set model
    const descendants = await this.fileRepository.prisma.file.findMany({
      where: {
        treeOwnerId: folder.treeOwnerId,
        left: { gt: folder.left },
        right: { lt: folder.right },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    // Apply permissions to all descendants for all users (mark as inherited)
    const descendantPermissions = [];
    for (const descendant of descendants) {
      for (const userId of dto.userIds) {
        try {
          const permission = await this._shareFileWithUser(
            descendant.id,
            currentUserId,
            userId,
            dto.role,
            true, // Mark as inherited
          );
          descendantPermissions.push(permission);
        } catch (error) {
          // Log error but continue with other files
          console.error(
            `Failed to share descendant ${descendant.id} with user ${userId}:`,
            error,
          );
        }
      }
    }

    return {
      folderPermissions,
      descendants: descendantPermissions,
      totalShared: folderPermissions.length + descendantPermissions.length,
    };
  }

  /**
   * Remove inherited permissions for all descendants when a folder permission is removed
   */
  private async removeInheritedPermissions(
    folderId: string,
    userId: string,
  ): Promise<void> {
    const folder = await this.fileRepository.scoped
      .filterById(folderId)
      .filterByNotTrashed()
      .getOne();

    if (!folder || folder.type !== 'FOLDER') {
      return;
    }

    // Get all descendant file IDs using nested set model
    const descendants = await this.fileRepository.prisma.file.findMany({
      where: {
        treeOwnerId: folder.treeOwnerId,
        left: { gt: folder.left },
        right: { lt: folder.right },
      },
      select: { id: true },
    });

    // Remove inherited permissions for this user from all descendants
    await this.filePermissionRepository.prisma.filePermission.deleteMany({
      where: {
        userId,
        isInherited: true,
        fileId: {
          in: descendants.map((d) => d.id),
        },
      },
    });
  }

  async unshareFilePublic(fileId: string, currentUserId: string) {
    await this.validateSharingPermissions(fileId, currentUserId);
    return this.filePermissionRepository.prisma.filePermission.deleteMany({
      where: {
        fileId,
        userId: null,
      },
    });
  }
}
