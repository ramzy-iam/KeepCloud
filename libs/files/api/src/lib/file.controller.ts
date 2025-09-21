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
} from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FilePreviewDto,
  PresignedGetResultDto,
  UpdateFilePermissionDto,
  ShareFileDto,
  FilePermissionDto,
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
  @Post(':fileId/share')
  async shareFile(
    @Param('fileId') fileId: string,
    @CurrentUser() currentUser: User,
    @Body() dto: ShareFileDto,
  ) {
    // Service will automatically determine if recursive sharing is needed based on file type
    return this.fileSharingService.shareFile(fileId, currentUser.id, dto);
  }

  @Delete(':fileId/permission/:permissionId')
  async revokePermission(
    @Param('fileId') fileId: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.fileSharingService.revokePermission(
      fileId,
      permissionId,
      currentUser.id,
    );
  }

  @Put(':fileId/permissions/:permissionId')
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

  @Get(':fileId/permissions')
  @Serialize(FilePermissionDto)
  async getPermissions(
    @Param('fileId') fileId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.fileSharingService.getFilePermissions(fileId, currentUser.id);
  }

  @Delete(':fileId/permissions/:userId')
  async removeCollaborator(
    @Param('fileId') fileId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.fileSharingService.removeCollaborator(
      fileId,
      userId,
      currentUser.id,
    );
  }
}
