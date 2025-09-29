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
  FileSharingService,
} from '@keepcloud/core/services';
import {
  FileMinViewDto,
  PaginationDto,
  FolderFilterDto,
  RenameFolderDto,
  TrashedFileDto,
  UserStorageDto,
  StorageBreakdownDto,
  BulkDeleteDto,
  BulkDeleteResultDto,
  BulkTrashDto,
  BulkTrashResultDto,
  BulkRestoreDto,
  BulkRestoreResultDto,
} from '@keepcloud/commons/dtos';
import { UserProfileDto } from '@keepcloud/commons/dtos';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly fileSharingService: FileSharingService,
  ) {}

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
  rename(
    @Param('id') id: string,
    @Body() dto: RenameFolderDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.rename(user.id, id, dto.name);
  }

  @Post('resources/:id/restore')
  @Serialize(FileMinViewDto)
  restore(@Param('id') id: string, @CurrentUser() user: UserProfileDto) {
    return this.storageService.restore(user.id, id);
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

  @Post('bulk/delete')
  @Serialize(BulkDeleteResultDto)
  async bulkDelete(
    @Body() dto: BulkDeleteDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.bulkDelete(user.id, dto.fileIds);
  }

  @Post('bulk/trash')
  @Serialize(BulkTrashResultDto)
  async bulkMoveToTrash(
    @Body() dto: BulkTrashDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.bulkMoveToTrash(user.id, dto.fileIds);
  }

  @Post('bulk/restore')
  @Serialize(BulkRestoreResultDto)
  async bulkRestore(
    @Body() dto: BulkRestoreDto,
    @CurrentUser() user: UserProfileDto,
  ) {
    return this.storageService.bulkRestore(user.id, dto.fileIds);
  }
}
