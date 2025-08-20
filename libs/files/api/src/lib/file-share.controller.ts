import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post,
  ForbiddenException,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPipe,
  Serialize,
  FileShareService,
  Public,
} from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  CreateShareLinkDto,
  UpdateShareLinkDto,
  ShareLinkResponseDto,
  SharedFileAccessDto,
} from '@keepcloud/commons/dtos';

@Controller('files')
export class FileShareController {
  constructor(private readonly fileShareService: FileShareService) {}

  @Post(':fileId/share')
  @Serialize(ShareLinkResponseDto)
  createShareLink(
    @Param('fileId') fileId: string,
    @Body() dto: CreateShareLinkDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.createShareLink(user.id, fileId, dto);
  }

  @Get(':fileId/share')
  @Serialize(ShareLinkResponseDto)
  getShareInfo(
    @Param('fileId') fileId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.getShareInfo(user.id, fileId);
  }

  @Patch(':fileId/share')
  @Serialize(ShareLinkResponseDto)
  updateShareLink(
    @Param('fileId') fileId: string,
    @Body() dto: UpdateShareLinkDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.updateShareLink(user.id, fileId, dto);
  }

  @Delete(':fileId/share')
  removeShareLink(
    @Param('fileId') fileId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.removeShareLink(user.id, fileId);
  }

  @Get('shared/:shareToken')
  @Public()
  @Serialize(SharedFileAccessDto)
  getSharedFile(@Param('shareToken') shareToken: string) {
    return this.fileShareService.getFileByShareToken(shareToken);
  }

  @Get('shared/:shareToken/download')
  @Public()
  async downloadSharedFile(@Param('shareToken') shareToken: string) {
    const sharedFileAccess = await this.fileShareService.getFileByShareToken(shareToken);
    
    if (!sharedFileAccess.canDownload) {
      throw new ForbiddenException('Download not allowed for this share');
    }

    // Return presigned download URL
    return this.fileShareService.generateDownloadUrl(shareToken);
  }
}