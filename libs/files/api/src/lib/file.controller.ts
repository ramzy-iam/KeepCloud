import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import {
  CurrentUser,
  FileService,
  FileSharingService,
  Serialize,
  PublicRoute,
} from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FilePreviewDto,
  PresignedGetResultDto,
  CreateShareableLinkDto,
  UpdateFilePermissionDto,
  BulkShareDto,
} from '@keepcloud/commons/dtos';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly fileSharingService: FileSharingService,
  ) {}

  @Post()
  @Serialize(FilePreviewDto)
  create(@Body() dto: CreateFileDto, @CurrentUser() user: User) {
    return this.fileService.create(user.id, dto);
  }

  @Post('presigned-post')
  getPresignedPost(
    @CurrentUser() user: User,
    @Body() payload: CreatePresignedPostBody,
  ) {
    const { filename } = payload;
    return this.fileService.getPresignedPost(user.id, filename);
  }

  @Get(':fileId/presigned-get')
  @Serialize(PresignedGetResultDto)
  presignedGet(@Param('fileId') fileId: string, @CurrentUser() user: User) {
    return this.fileService.generatePresignedGet(user.id, fileId);
  }

  // ===== SHARING OPERATIONS =====

  /**
   * Share a file with multiple users (bulk sharing by default)
   */
  @Post(':fileId/share/users')
  async shareFileWithUsers(
    @Param('fileId') fileId: string,
    @CurrentUser() currentUser: User,
    @Body() dto: BulkShareDto,
  ) {
    return this.fileSharingService.bulkShareFile(fileId, currentUser.id, dto);
  }

  /**
   * Remove user access from a file
   */
  @Delete(':fileId/share/users/:userId')
  async removeUserAccess(
    @Param('fileId') fileId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.fileSharingService.removeUserAccess(
      fileId,
      userId,
      currentUser.id,
    );
  }

  /**
   * Create a shareable link for a file
   */
  @Post(':fileId/share/links')
  async createShareableLink(
    @Param('fileId') fileId: string,
    @CurrentUser() currentUser: User,
    @Body() dto: CreateShareableLinkDto,
  ) {
    return this.fileSharingService.createShareableLink(
      fileId,
      currentUser.id,
      dto,
    );
  }

  /**
   * Remove a shareable link
   */
  @Delete('share/links/:linkId')
  async removeShareableLink(
    @Param('linkId') linkId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.fileSharingService.removeShareableLink(linkId, currentUser.id);
  }

  /**
   * Get complete sharing information for a file
   */
  @Get(':fileId/share')
  async getFileSharingInfo(
    @Param('fileId') fileId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.fileSharingService.getFileSharingInfo(fileId, currentUser.id);
  }

  /**
   * Update permission role for an existing share
   */
  @Put('share/permissions/:permissionId')
  async updatePermissionRole(
    @Param('permissionId') permissionId: string,
    @CurrentUser() currentUser: User,
    @Body() dto: UpdateFilePermissionDto,
  ) {
    return this.fileSharingService.updatePermissionRole(
      permissionId,
      currentUser.id,
      dto,
    );
  }

  /**
   * Access file via shareable link (public endpoint)
   */
  @PublicRoute()
  @Get('link/:token')
  async accessFileByLink(@Param('token') token: string) {
    return this.fileSharingService.accessFileByLink(token);
  }
}
