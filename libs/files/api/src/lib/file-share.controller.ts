import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post 
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPipe,
  Serialize,
  FileShareService,
} from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  CreateFileShareDto,
  UpdateFileShareDto,
  FileShareResponseDto,
  ShareFileWithUserDto,
} from '@keepcloud/commons/dtos';

@Controller('files')
export class FileShareController {
  constructor(private readonly fileShareService: FileShareService) {}

  @Post(':fileId/share')
  @Serialize(FileShareResponseDto)
  shareFileWithUser(
    @Param('fileId') fileId: string,
    @Body() dto: ShareFileWithUserDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.shareFileWithUser(user.id, fileId, dto);
  }

  @Post('share')
  @Serialize(FileShareResponseDto)
  shareFile(
    @Body() dto: CreateFileShareDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.shareFile(user.id, dto);
  }

  @Get(':fileId/shares')
  @Serialize([FileShareResponseDto])
  getFileShares(
    @Param('fileId') fileId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.getFileShares(user.id, fileId);
  }

  @Get('shared-with-me')
  @Serialize([FileShareResponseDto])
  getSharedWithMe(@CurrentUser(CurrentUserPipe) user: User) {
    return this.fileShareService.getSharedWithMe(user.id);
  }

  @Patch('shares/:shareId')
  @Serialize(FileShareResponseDto)
  updateFileShare(
    @Param('shareId') shareId: string,
    @Body() dto: UpdateFileShareDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.updateFileShare(user.id, shareId, dto);
  }

  @Delete('shares/:shareId')
  deleteFileShare(
    @Param('shareId') shareId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.fileShareService.deleteFileShare(user.id, shareId);
  }
}