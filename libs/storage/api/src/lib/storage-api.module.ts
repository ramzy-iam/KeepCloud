import { StorageService } from '@keepcloud/core/services';
import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageApiModule {}
