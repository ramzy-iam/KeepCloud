import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body,
  NotFoundException 
} from '@nestjs/common';
import { SharingService } from '@keepcloud/core/services';
import { 
  CurrentUser, 
  CurrentUserPipe, 
  Serialize 
} from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import { 
  ShareFileDto, 
  SharedFileInfoDto, 
  AccessSharedFileDto 
} from '@keepcloud/commons/dtos';

@Controller('sharing')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post('files/:fileId/share')
  @Serialize(SharedFileInfoDto)
  async shareFile(
    @Param('fileId') fileId: string,
    @Body() shareFileDto: ShareFileDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.sharingService.shareFile(fileId, user.id, shareFileDto);
  }

  @Get('files/:fileId/info')
  @Serialize(SharedFileInfoDto)
  async getShareInfo(
    @Param('fileId') fileId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    const shareInfo = await this.sharingService.getShareInfo(fileId, user.id);
    if (!shareInfo) {
      throw new NotFoundException('File is not shared');
    }
    return shareInfo;
  }

  @Delete('files/:fileId/share')
  async revokeShare(
    @Param('fileId') fileId: string,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    await this.sharingService.revokeShare(fileId, user.id);
    return { message: 'Share revoked successfully' };
  }

  @Get('files')
  @Serialize([SharedFileInfoDto])
  async getSharedFiles(@CurrentUser(CurrentUserPipe) user: User) {
    return this.sharingService.getSharedFiles(user.id);
  }

  @Get(':token')
  @Serialize(AccessSharedFileDto)
  async accessSharedFile(@Param('token') token: string) {
    return this.sharingService.accessSharedFile(token);
  }
}