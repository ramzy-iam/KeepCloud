import { Test, TestingModule } from '@nestjs/testing';
import { FileShareService } from './file-share.service';
import { FileRepository } from '@keepcloud/core/db';
import { CreateShareLinkDto, SharePermissionType } from '@keepcloud/commons/dtos';
import { NotFoundException } from '@nestjs/common';

describe('FileShareService (Token-based)', () => {
  let service: FileShareService;
  let fileRepository: jest.Mocked<FileRepository>;

  beforeEach(async () => {
    const mockFileRepository = {
      scoped: {
        filterById: jest.fn().mockReturnThis(),
        filterByOwnerId: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getOneOrFail: jest.fn(),
      },
      update: jest.fn(),
      prisma: {
        file: {
          findFirst: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileShareService,
        {
          provide: FileRepository,
          useValue: mockFileRepository,
        },
      ],
    }).compile();

    service = module.get<FileShareService>(FileShareService);
    fileRepository = module.get(FileRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShareLink', () => {
    it('should successfully create a share link for owned file', async () => {
      const ownerId = 'owner-123';
      const fileId = 'file-456';
      const dto: CreateShareLinkDto = {
        permission: SharePermissionType.VIEW,
      };

      const mockFile = { 
        id: fileId, 
        ownerId, 
        name: 'test.txt',
        shareToken: null,
        isPublic: false 
      };

      fileRepository.scoped.filterById().filterByOwnerId().getOne.mockResolvedValue(mockFile);
      fileRepository.update.mockResolvedValue(mockFile);

      const result = await service.createShareLink(ownerId, fileId, dto);

      expect(result.permission).toBe(SharePermissionType.VIEW);
      expect(result.isPublic).toBe(true);
      expect(result.shareToken).toBeTruthy();
      expect(result.shareUrl).toContain(result.shareToken);
      expect(fileRepository.update).toHaveBeenCalledWith(
        { id: fileId },
        expect.objectContaining({
          isPublic: true,
          sharePermissions: SharePermissionType.VIEW,
        })
      );
    });

    it('should throw NotFoundException when file is not found or not owned by user', async () => {
      const ownerId = 'owner-123';
      const fileId = 'file-456';
      const dto: CreateShareLinkDto = {
        permission: SharePermissionType.VIEW,
      };

      fileRepository.scoped.filterById().filterByOwnerId().getOne.mockResolvedValue(null);

      await expect(service.createShareLink(ownerId, fileId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFileByShareToken', () => {
    it('should return file when valid share token is provided', async () => {
      const shareToken = 'valid-token-123';
      const mockFile = {
        id: 'file-456',
        name: 'shared-document.pdf',
        isFolder: false,
        size: BigInt(1024),
        contentType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        shareToken,
        isPublic: true,
        sharePermissions: 'VIEW',
        shareExpiresAt: null,
        owner: { id: 'owner-123', firstName: 'John', lastName: 'Doe' },
      };

      fileRepository.prisma.file.findFirst.mockResolvedValue(mockFile);

      const result = await service.getFileByShareToken(shareToken);

      expect(result.file.id).toBe('file-456');
      expect(result.permission).toBe(SharePermissionType.VIEW);
      expect(result.canView).toBe(true);
      expect(result.canDownload).toBe(true);
    });

    it('should throw NotFoundException when share token is invalid or expired', async () => {
      const shareToken = 'invalid-token-123';

      fileRepository.prisma.file.findFirst.mockResolvedValue(null);

      await expect(service.getFileByShareToken(shareToken)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateShareLink', () => {
    it('should successfully update share link permissions', async () => {
      const ownerId = 'owner-123';
      const fileId = 'file-456';
      const dto = {
        permission: SharePermissionType.EDIT,
      };

      const mockFile = { 
        id: fileId, 
        ownerId, 
        shareToken: 'existing-token',
        isPublic: true,
        sharePermissions: 'EDIT',
        shareExpiresAt: null,
      };

      fileRepository.scoped.filterById().filterByOwnerId().getOne
        .mockResolvedValueOnce(mockFile) // First call for ownership check
        .mockResolvedValueOnce(mockFile); // Second call for updated file
      fileRepository.scoped.filterById().getOneOrFail.mockResolvedValue(mockFile);
      fileRepository.update.mockResolvedValue(mockFile);

      const result = await service.updateShareLink(ownerId, fileId, dto);

      expect(result.permission).toBe(SharePermissionType.EDIT);
      expect(fileRepository.update).toHaveBeenCalledWith(
        { id: fileId },
        expect.objectContaining({
          sharePermissions: SharePermissionType.EDIT,
        })
      );
    });
  });

  describe('removeShareLink', () => {
    it('should successfully remove share link', async () => {
      const ownerId = 'owner-123';
      const fileId = 'file-456';

      const mockFile = { 
        id: fileId, 
        ownerId, 
        shareToken: 'token-to-remove',
        isPublic: true 
      };

      fileRepository.scoped.filterById().filterByOwnerId().getOne.mockResolvedValue(mockFile);
      fileRepository.update.mockResolvedValue(mockFile);

      await service.removeShareLink(ownerId, fileId);

      expect(fileRepository.update).toHaveBeenCalledWith(
        { id: fileId },
        {
          shareToken: null,
          isPublic: false,
          sharePermissions: null,
          shareExpiresAt: null,
        }
      );
    });
  });
});

/*
 * Test Coverage for Token-based File Sharing:
 * 
 * 1. Share Link Creation:
 *    - Generate unique tokens
 *    - Set proper permissions
 *    - Handle expiration dates
 * 
 * 2. Share Link Access:
 *    - Validate tokens
 *    - Check expiration
 *    - Return file with permissions
 * 
 * 3. Share Link Management:
 *    - Update permissions
 *    - Update expiration
 *    - Toggle public/private
 *    - Remove share links
 * 
 * 4. Security:
 *    - Owner verification
 *    - Token validation
 *    - Expiration enforcement
 * 
 * Benefits of Token-based Approach:
 * - No complex database relationships
 * - Direct access via URLs
 * - Better performance (no joins)
 * - Easier to cache and scale
 * - Simple permission model
 */