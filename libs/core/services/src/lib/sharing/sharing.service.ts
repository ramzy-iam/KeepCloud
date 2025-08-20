import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FileRepository } from '@keepcloud/core/db';
import * as crypto from 'crypto';

export interface ShareFileOptions {
  expiresIn?: number; // Hours until expiry (optional)
  makePublic?: boolean; // Make file publicly accessible
}

export interface SharedFileInfo {
  id: string;
  name: string;
  shareToken: string;
  shareUrl: string;
  isPublic: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

@Injectable()
export class SharingService {
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Generate a shareable link for a file
   */
  async shareFile(fileId: string, ownerId: string, options: ShareFileOptions = {}): Promise<SharedFileInfo> {
    // Verify file exists and user owns it
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException('File not found or access denied');
    }

    // Generate secure share token
    const shareToken = this.generateShareToken();
    
    // Calculate expiry if provided
    const shareExpiry = options.expiresIn 
      ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
      : null;

    // Update file with sharing information
    const updatedFile = await this.fileRepository.update(
      { id: fileId },
      {
        isShared: true,
        isPublic: options.makePublic || false,
        shareToken,
        shareExpiry,
      }
    );

    return {
      id: updatedFile.id,
      name: updatedFile.name,
      shareToken,
      shareUrl: this.generateShareUrl(shareToken),
      isPublic: updatedFile.isPublic,
      expiresAt: shareExpiry,
      createdAt: updatedFile.createdAt,
    };
  }

  /**
   * Access a shared file using share token
   */
  async accessSharedFile(shareToken: string) {
    const file = await this.fileRepository.scoped
      .filterByShareToken(shareToken)
      .filterNotDeleted()
      .getOne();

    if (!file) {
      throw new NotFoundException('Shared file not found');
    }

    // Check if share has expired
    if (file.shareExpiry && new Date() > file.shareExpiry) {
      throw new BadRequestException('Share link has expired');
    }

    if (!file.isShared) {
      throw new BadRequestException('File is not shared');
    }

    return {
      id: file.id,
      name: file.name,
      contentType: file.contentType,
      size: file.size,
      isFolder: file.isFolder,
      createdAt: file.createdAt,
      owner: {
        firstName: file.owner?.firstName,
        lastName: file.owner?.lastName,
      },
    };
  }

  /**
   * Revoke sharing for a file
   */
  async revokeShare(fileId: string, ownerId: string): Promise<void> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException('File not found or access denied');
    }

    await this.fileRepository.update(
      { id: fileId },
      {
        isShared: false,
        isPublic: false,
        shareToken: null,
        shareExpiry: null,
      }
    );
  }

  /**
   * Get sharing information for a file
   */
  async getShareInfo(fileId: string, ownerId: string): Promise<SharedFileInfo | null> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterByOwnerId(ownerId)
      .getOne();

    if (!file) {
      throw new NotFoundException('File not found or access denied');
    }

    if (!file.isShared || !file.shareToken) {
      return null;
    }

    return {
      id: file.id,
      name: file.name,
      shareToken: file.shareToken,
      shareUrl: this.generateShareUrl(file.shareToken),
      isPublic: file.isPublic,
      expiresAt: file.shareExpiry,
      createdAt: file.createdAt,
    };
  }

  /**
   * List all shared files for a user
   */
  async getSharedFiles(ownerId: string): Promise<SharedFileInfo[]> {
    const sharedFiles = await this.fileRepository.scoped
      .filterByOwnerId(ownerId)
      .filterByIsShared(true)
      .filterNotDeleted()
      .getMany();

    return sharedFiles
      .filter(file => file.shareToken)
      .map(file => ({
        id: file.id,
        name: file.name,
        shareToken: file.shareToken!,
        shareUrl: this.generateShareUrl(file.shareToken!),
        isPublic: file.isPublic,
        expiresAt: file.shareExpiry,
        createdAt: file.createdAt,
      }));
  }

  /**
   * Check if a file can be accessed by a user
   */
  async canAccessFile(fileId: string, userId?: string): Promise<boolean> {
    const file = await this.fileRepository.scoped
      .filterById(fileId)
      .filterNotDeleted()
      .getOne();

    if (!file) {
      return false;
    }

    // Owner always has access
    if (userId && file.ownerId === userId) {
      return true;
    }

    // Check if file is publicly shared
    if (file.isPublic && file.isShared) {
      // Check expiry
      if (file.shareExpiry && new Date() > file.shareExpiry) {
        return false;
      }
      return true;
    }

    return false;
  }

  private generateShareToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateShareUrl(token: string): string {
    // This would use your actual domain
    return `${process.env.APP_URL || 'http://localhost:3000'}/share/${token}`;
  }
}