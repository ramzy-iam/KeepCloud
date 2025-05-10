import { Body, Controller, Post } from '@nestjs/common';
import { FileService } from '@keepcloud/core/services';
import { CreateFolderDto } from '@keepcloud/commons/dtos';

@Controller('folders')
export class FolderController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  create(@Body() dto: CreateFolderDto) {
    return this.fileService.createFolder(dto);
  }
}
