import { Injectable } from '@nestjs/common';
import { FileRepository, FilePermissionRole } from '@keepcloud/core/db';
import {
  ForbiddenException,
  FileNotFoundException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';

@Injectable()
export class FilePermissionService {
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Check if user has access to a file through ownership or permissions
   */
  async hasAccess(fileId: string, userId: string): Promise<boolean> {
    return this.fileRepository.hasAncestorAccess(fileId, userId);
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
    const hasAccess = await this.hasAccess(fileId, userId);

    if (!hasAccess) {
      throw new ForbiddenException({
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'You do not have access to this resource',
      });
    }

    // Get the file to check ownership
    const file = await this.fileRepository.scoped.filterById(fileId).getOne();

    if (!file) {
      throw new FileNotFoundException(fileId);
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
  async getUserEffectiveRole(
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

  /**
   * Check if user can perform a specific action on a file
   */
  async canPerformAction(
    fileId: string,
    userId: string,
    action: 'read' | 'write' | 'delete' | 'share',
  ): Promise<boolean> {
    try {
      const roleMap = {
        read: FilePermissionRole.VIEWER,
        write: FilePermissionRole.EDITOR,
        delete: FilePermissionRole.OWNER,
        share: FilePermissionRole.EDITOR,
      };

      await this.verifyUserRole(fileId, userId, roleMap[action]);
      return true;
    } catch {
      return false;
    }
  }
}
