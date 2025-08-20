import { FileService, FolderService } from '@keepcloud/core/services';
import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FileController } from './file.controller';
import { FileRepository, UserRepository } from '@keepcloud/core/db';

@Module({
  controllers: [FolderController, FileController],
  providers: [
    FileService, 
    FolderService, 
    FileRepository, 
    UserRepository
  ],
})
export class FileApiModule {}
