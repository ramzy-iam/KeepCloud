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
import { Serialize, StorageService } from '@keepcloud/core/services';
import {
  FileMinViewDto,
  PaginationDto,
  FolderFilterDto,
  RenameFolderDto,
  TrashedFileDto,
} from '@keepcloud/commons/dtos';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('my-storage')
  @Serialize(new PaginationDto(FileMinViewDto))
  getRootItems(@Query() filters: FolderFilterDto) {
    return this.storageService.getRootItems(filters);
  }

  @Get('shared-with-me')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSharedWithMe(@Query() filters: FolderFilterDto) {
    return this.storageService.getSharedWithMe(filters);
  }

  @Get('trash')
  @Serialize(new PaginationDto(TrashedFileDto))
  getTrashedItems(@Query() filters: FolderFilterDto) {
    return this.storageService.getTrashedItems(filters);
  }

  @Get('suggested-folders')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSuggestedFolders() {
    return this.storageService.getSuggestedFolders();
  }

  @Get('suggested-files')
  @Serialize(new PaginationDto(FileMinViewDto))
  getSuggestedFiles() {
    return this.storageService.getSuggestedFiles();
  }

  @Get('tree')
  @Serialize(new PaginationDto(FileMinViewDto))
  getFoldersForTree(@Query() filters: FolderFilterDto) {
    return this.storageService.getFoldersForTree(filters);
  }

  @Patch('resources/:id/rename')
  @Serialize(FileMinViewDto)
  rename(@Param('id') id: string, @Body() dto: RenameFolderDto) {
    return this.storageService.rename(id, dto.name);
  }

  @Post('resources/:id/restore')
  @Serialize(FileMinViewDto)
  restore(@Param('id') id: string) {
    return this.storageService.restore(id);
  }

  @Post('resources/:id/trash')
  @Serialize(FileMinViewDto)
  moveToTrash(@Param('id') id: string) {
    return this.storageService.moveToTrash(id);
  }

  @Delete('resources/:id')
  @Serialize(FileMinViewDto)
  delete(@Param('id') id: string) {
    return this.storageService.delete(id);
  }
}
