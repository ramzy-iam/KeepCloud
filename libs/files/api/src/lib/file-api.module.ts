import { FileService, FolderService, FileShareService } from '@keepcloud/core/services';
import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FileController } from './file.controller';
import { FileShareController } from './file-share.controller';
import { FileRepository, SharedFileRepository, UserRepository } from '@keepcloud/core/db';

@Module({
  controllers: [FolderController, FileController, FileShareController],
  providers: [
    FileService, 
    FolderService, 
    FileShareService,
    FileRepository, 
    SharedFileRepository,
    UserRepository
  ],
})
export class FileApiModule {}
