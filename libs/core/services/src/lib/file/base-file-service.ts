import {
  FileTrashedException,
  FolderTrashedException,
  ParentFolderTrashedException,
  ForbiddenException,
} from '@keepcloud/commons/backend';
import { FileRepository, File, FilePermissionRole } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';
import { NestedSetService } from '../storage';
import { ErrorCode } from '@keepcloud/commons/constants';

@Injectable()
export abstract class BaseFileService {
  constructor(
    protected readonly fileRepository: FileRepository,
    protected readonly nestedSetService: NestedSetService,
  ) {}

  abstract create(...dto: unknown[]): Promise<File>;

  async checkAndThrowIfTrashed(fileId: string): Promise<void> {
    const { trashedBy, isFolder } = await this.fileRepository.isTrashed(fileId);

    if (!trashedBy) {
      // Not trashed at all, just return
      return;
    }

    switch (trashedBy) {
      case 'self':
        if (isFolder) {
          throw new FolderTrashedException();
        } else {
          throw new FileTrashedException();
        }
      case 'parent':
        throw new ParentFolderTrashedException();
    }
  }

  /**
   * Verify user has minimum required role for the file/folder or its ancestors
   */
  async verifyUserRole(
    fileId: string,
    userId: string,
    minimumRole: FilePermissionRole,
  ): Promise<void> {
    // First check if user has access at all
    const hasAccess = await this.fileRepository.hasAncestorAccess(
      fileId,
      userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'You do not have access to this resource',
      });
    }

    // Get the file to check ownership
    const file = await this.fileRepository.scoped.filterById(fileId).getOne();

    if (!file) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'File not found',
      });
    }

    // Check if user is owner or tree owner (automatically has all permissions)
    if (file.ownerId === userId || file.treeOwnerId === userId) {
      return;
    }

    // Check role hierarchy for shared access
    const roleHierarchy = {
      [FilePermissionRole.VIEWER]: 1,
      [FilePermissionRole.EDITOR]: 2,
      [FilePermissionRole.OWNER]: 3,
    };

    // Find the user's permission for this file or its ancestors
    const userRole = await this.getUserEffectiveRole(fileId, userId);

    if (!userRole || roleHierarchy[userRole] < roleHierarchy[minimumRole]) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: `You need ${minimumRole} role or higher to perform this action`,
      });
    }
  }

  /**
   * Get the effective role for a user on a file (including inherited from ancestors)
   */
  private async getUserEffectiveRole(
    fileId: string,
    userId: string,
  ): Promise<FilePermissionRole | null> {
    const file = await this.fileRepository.scoped.filterById(fileId).getOne();

    if (!file) return null;

    // Check if user is owner or tree owner (treat tree owner as OWNER role)
    if (file.ownerId === userId || file.treeOwnerId === userId) {
      return FilePermissionRole.OWNER;
    }

    // Find all ancestors using nested set model and check their permissions
    const ancestorsWithPermissions =
      await this.fileRepository.prisma.file.findMany({
        where: {
          treeOwnerId: file.treeOwnerId,
          left: { lte: file.left },
          right: { gte: file.right },
          permissions: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          permissions: {
            where: {
              userId: userId,
            },
          },
        },
        orderBy: {
          left: 'desc', // Start from the most specific (closest to the file)
        },
      });

    // Return the highest role found in the hierarchy
    let highestRole: FilePermissionRole | null = null;
    const roleHierarchy = {
      [FilePermissionRole.VIEWER]: 1,
      [FilePermissionRole.EDITOR]: 2,
      [FilePermissionRole.OWNER]: 3,
    };

    for (const ancestor of ancestorsWithPermissions) {
      for (const permission of ancestor.permissions) {
        if (
          !highestRole ||
          roleHierarchy[permission.role] > roleHierarchy[highestRole]
        ) {
          highestRole = permission.role;
        }
      }
    }

    return highestRole;
  }
}
