import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  CurrentUser,
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
} from '@keepcloud/commons/dtos';
import { User } from '@keepcloud/core/db';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @Serialize(FileMinViewDto)
  create(@Body() dto: CreateFolderDto, @CurrentUser() user: User) {
    return this.folderService.create({ ...dto, ownerId: user.id });
  }

  @Get(':id/children')
  @Serialize(new PaginationDto(FileMinViewDto))
  async getChildren(
    @Param('id') id: string,
    @Query() filters: FolderFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.folderService.getChildren(user.id, id, filters);
  }

  @Get(':id')
  @Serialize(FileDetailsDto)
  async getOne(
    @Param('id') id: string,
    @Query() query: GetOneFolderQueryDto,
    @CurrentUser() user: User,
  ) {
    const { file, ancestors } = await this.folderService.getOne(
      user.id,
      id,
      query.withAncestors,
    );
    return { ...file, ancestors };
  }
}
