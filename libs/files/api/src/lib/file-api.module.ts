import { FileService, FolderService, FileShareService } from '@keepcloud/core/services';
import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FileController } from './file.controller';
import { FileShareController } from './file-share.controller';
import { FileRepository } from '@keepcloud/core/db';

@Module({
  controllers: [FolderController, FileController, FileShareController],
  providers: [
    FileService, 
    FolderService, 
    FileShareService,
    FileRepository, 
    // SharedFileRepository removed - using token-based sharing
    // UserRepository removed - not needed for token-based sharing
  ],
})
export class FileApiModule {}
