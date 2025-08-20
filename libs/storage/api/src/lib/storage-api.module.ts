import { StorageService } from '@keepcloud/core/services';
import { SharedFileRepository } from '@keepcloud/core/db';
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService, SharedFileRepository],
})
export class StorageApiModule {}
