import { Module } from '@nestjs/common';
import { SharingService } from '@keepcloud/core/services';
import { FileRepository } from '@keepcloud/core/db';
import { SharingController } from './sharing.controller';

@Module({
  controllers: [SharingController],
  providers: [SharingService, FileRepository],
})
export class SharingApiModule {}