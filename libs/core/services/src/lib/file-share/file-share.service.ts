import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FileRepository } from '@keepcloud/core/db';
import { 
  CreateShareLinkDto, 
  UpdateShareLinkDto, 
  ShareLinkResponseDto,
  SharedFileAccessDto,
  SharePermissionType 
} from '@keepcloud/commons/dtos';
import { ErrorCode } from '@keepcloud/commons/constants';
import { randomBytes } from 'crypto';

@Injectable()
export class FileShareService {
  constructor(
    private readonly fileRepository: FileRepository,
  ) {}

  async createShareLink(ownerId: string, fileId: string, dto: CreateShareLinkDto): Promise<ShareLinkResponseDto> {
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

    // Generate unique share token
    const shareToken = this.generateShareToken();
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    // Update file with sharing information
    await this.fileRepository.update(
      { id: fileId },
      {
        shareToken,
        isPublic: true,
        sharePermissions: dto.permission || SharePermissionType.VIEW,
        shareExpiresAt: expiresAt,
      }
    );

    return {
      shareToken,
      shareUrl: this.buildShareUrl(shareToken),
      expiresAt,
      permission: dto.permission || SharePermissionType.VIEW,
      isPublic: true,
    };
  }

  async updateShareLink(ownerId: string, fileId: string, dto: UpdateShareLinkDto): Promise<ShareLinkResponseDto> {
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

    const updateData: any = {};
    
    if (dto.permission !== undefined) {
      updateData.sharePermissions = dto.permission;
    }
    
    if (dto.expiresAt !== undefined) {
      updateData.shareExpiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    
    if (dto.isPublic !== undefined) {
      updateData.isPublic = dto.isPublic;
      // If making private, remove share token
      if (!dto.isPublic) {
        updateData.shareToken = null;
        updateData.shareExpiresAt = null;
      }
    }

    await this.fileRepository.update({ id: fileId }, updateData);

    const updatedFile = await this.fileRepository.scoped
      .filterById(fileId)
      .getOneOrFail();

    return {
      shareToken: updatedFile.shareToken || '',
      shareUrl: updatedFile.shareToken ? this.buildShareUrl(updatedFile.shareToken) : '',
      expiresAt: updatedFile.shareExpiresAt,
      permission: (updatedFile.sharePermissions as SharePermissionType) || SharePermissionType.VIEW,
      isPublic: updatedFile.isPublic,
    };
  }

  async removeShareLink(ownerId: string, fileId: string): Promise<void> {
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

    // Remove sharing information
    await this.fileRepository.update(
      { id: fileId },
      {
        shareToken: null,
        isPublic: false,
        sharePermissions: null,
        shareExpiresAt: null,
      }
    );
  }

  async getFileByShareToken(shareToken: string): Promise<SharedFileAccessDto> {
    const file = await this.fileRepository.prisma.file.findFirst({
      where: {
        shareToken,
        isPublic: true,
        OR: [
          { shareExpiresAt: null },
          { shareExpiresAt: { gt: new Date() } }
        ]
      },
      include: {
        owner: true
      }
    });

    if (!file) {
      throw new NotFoundException({
        message: 'Share link not found or expired',
      });
    }

    const permission = (file.sharePermissions as SharePermissionType) || SharePermissionType.VIEW;

    return {
      file: {
        id: file.id,
        name: file.name,
        isFolder: file.isFolder,
        size: file.size,
        contentType: file.contentType,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        owner: file.owner
      },
      permission,
      expiresAt: file.shareExpiresAt,
      canDownload: permission === SharePermissionType.VIEW || permission === SharePermissionType.EDIT,
      canView: true,
    };
  }

  async getShareInfo(ownerId: string, fileId: string): Promise<ShareLinkResponseDto | null> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException({
        message: ErrorCode.FILE_NOT_FOUND,
      });
    }

    if (!file.shareToken || !file.isPublic) {
      return null;
    }

    return {
      shareToken: file.shareToken,
      shareUrl: this.buildShareUrl(file.shareToken),
      expiresAt: file.shareExpiresAt,
      permission: (file.sharePermissions as SharePermissionType) || SharePermissionType.VIEW,
      isPublic: file.isPublic,
    };
  }

  async generateDownloadUrl(shareToken: string): Promise<{ downloadUrl: string }> {
    const file = await this.fileRepository.prisma.file.findFirst({
      where: {
        shareToken,
        isPublic: true,
        OR: [
          { shareExpiresAt: null },
          { shareExpiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!file) {
      throw new NotFoundException({
        message: 'Share link not found or expired',
      });
    }

    // This would need to be implemented based on your storage solution
    // For now, returning the share URL as a placeholder
    return {
      downloadUrl: this.buildShareUrl(shareToken) + '/download'
    };
  }

  private generateShareToken(): string {
    return randomBytes(16).toString('hex');
  }

  private buildShareUrl(shareToken: string): string {
    // This should be configurable based on your domain
    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://keepcloud.com';
    return `${baseUrl}/shared/${shareToken}`;
  }
}