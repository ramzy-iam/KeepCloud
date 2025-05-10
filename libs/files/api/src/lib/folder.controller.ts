import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPipe,
  FolderService,
  Serialize,
} from '@keepcloud/core/services';
import {
  CreateFolderDto,
  FileDetailsDto,
  FileMinViewDto,
  GetChildrenResponseDto,
  RenameFolderDto,
} from '@keepcloud/commons/dtos';
import { User } from '@keepcloud/core/db';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @Serialize(FileMinViewDto)
  create(
    @Body() dto: CreateFolderDto,
    @CurrentUser(CurrentUserPipe) user: User,
  ) {
    return this.folderService.create({ ...dto, ownerId: user.id });
  }

  @Get(':id/children')
  @Serialize(GetChildrenResponseDto)
  getFolderChildren(@Param('id') id: string) {
    return this.folderService.getChildren(id);
  }

  @Get(':id')
  @Serialize(FileDetailsDto)
  getFolder(@Param('id') id: string) {
    return this.folderService.getOne(id);
  }

  @Patch(':id/rename')
  @Serialize(FileMinViewDto)
  rename(@Param('id') id: string, @Body() dto: RenameFolderDto) {
    return this.folderService.rename(id, dto.name);
  }

  @Post(':id/restore')
  @Serialize(FileMinViewDto)
  restore(@Param('id') id: string, @Body() dto: RenameFolderDto) {
    return this.folderService.restore(id);
  }

  @Delete(':id')
  @Serialize(FileMinViewDto)
  delete(@Param('id') id: string) {
    return this.folderService.delete(id);
  }
}
