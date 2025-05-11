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
  CurrentUserPipe,
  FolderService,
  Serialize,
} from '@keepcloud/core/services';
import {
  CreateFolderDto,
  FileDetailsDto,
  FileMinViewDto,
  FolderFilterDto,
  GetOneFolderQueryDto,
  PaginationDto,
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
  @Serialize(new PaginationDto(FileMinViewDto))
  async getChildren(
    @Param('id') id: string,
    @Query() filters: FolderFilterDto,
  ) {
    return this.folderService.getChildren(id, filters);
    // const { items, meta } = await this.folderService.getChildren(id, filters);
    // console.log({ items, meta });
    // return { items, meta };
  }

  @Get(':id')
  @Serialize(FileDetailsDto)
  async getOne(@Param('id') id: string, @Query() query: GetOneFolderQueryDto) {
    const { file, ancestors } = await this.folderService.getOne(
      id,
      query.withAncestors,
    );
    return { ...file, ancestors };
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
