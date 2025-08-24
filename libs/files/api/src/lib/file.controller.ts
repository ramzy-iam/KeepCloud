import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser, FileService, Serialize } from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FilePreviewDto,
  PresignedGetResultDto,
} from '@keepcloud/commons/dtos';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

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
}
