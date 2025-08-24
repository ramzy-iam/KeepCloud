import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CurrentUser,
  Serialize,
  StorageService,
} from '@keepcloud/core/services';
import {
  FileMinViewDto,
  PaginationDto,
  FolderFilterDto,
  RenameFolderDto,
  TrashedFileDto,
  UserStorageDto,
  StorageBreakdownDto,
} from '@keepcloud/commons/dtos';
import { UserProfileDto } from '@keepcloud/commons/dtos';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('my-storage')
  @Serialize(new PaginationDto(FileMinViewDto))
  getRootItems(
    @Query() filters: FolderFilterDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.getRootItems(user.id, filters);
  }

  @Get('shared-with-me')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSharedWithMe(
    @Query() filters: FolderFilterDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.getSharedWithMe(user.id, filters);
  }

  @Get('trash')
  @Serialize(new PaginationDto(TrashedFileDto))
  getTrashedItems(
    @Query() filters: FolderFilterDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.getTrashedItems(user.id, filters);
  }

  @Get('suggested-folders')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSuggestedFolders(@CurrentUser() user: UserProfileDto) {
    return this.storageService.getSuggestedFolders(user.id);
  }

  @Get('suggested-files')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSuggestedFiles(@CurrentUser() user: UserProfileDto) {
    return this.storageService.getSuggestedFiles(user.id);
  }

  @Get('tree')
  @Serialize(new PaginationDto(FileMinViewDto))
  getFoldersForTree(
    @Query() filters: FolderFilterDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.getFoldersForTree(user.id, filters);
  }

  @Patch('resources/:id/rename')
  @Serialize(FileMinViewDto)
  rename(@Param('id') id: string, @Body() dto: RenameFolderDto) {
    return this.storageService.rename(id, dto.name);
  }

  @Post('resources/:id/restore')
  @Serialize(FileMinViewDto)
  restore(@Param('id') id: string, @CurrentUser() user: UserProfileDto) {
    return this.storageService.restore(id, user.id);
  }

  @Post('resources/:id/trash')
  @Serialize(FileMinViewDto)
  moveToTrash(@Param('id') id: string, @CurrentUser() user: UserProfileDto) {
    return this.storageService.moveToTrash(user.id, id);
  }

  @Delete('resources/:id')
  @Serialize(FileMinViewDto)
  delete(@Param('id') id: string, @CurrentUser() user: UserProfileDto) {
    return this.storageService.delete(user.id, id);
  }

  @Get('usage')
  @Serialize(UserStorageDto)
  getUserStorage(@CurrentUser() user: UserProfileDto) {
    return this.storageService.getUserStorageInfo(user.id);
  }

  @Get('breakdown')
  @Serialize(StorageBreakdownDto)
  getStorageBreakdown(@CurrentUser() user: UserProfileDto) {
    return this.storageService.getStorageBreakdown(user.id);
  }
}
