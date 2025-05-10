import { FileService } from '@keepcloud/core/services';
import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FileController } from './file.controller';
import { FileRepository } from '@keepcloud/core/db';

@Module({
  controllers: [FolderController, FileController],
  providers: [FileService, FileRepository],
})
export class FileApiModule {}
