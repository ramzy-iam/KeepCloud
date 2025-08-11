import { Global, Module } from '@nestjs/common';
import {
  DeleteFileFromStorageProcessor,
  DeleteFileAndChildrenFromStorageProcessor,
  DeleteNodeProcessor,
  UpdateFileTagInAfterCreateProcessor,
  ProcessorProvider,
  RebuildTreeProcessor,
  SendEmailNotificationProcessor,
} from '@keepcloud/core/services';

const services = [
  ProcessorProvider,
  UpdateFileTagInAfterCreateProcessor,
  DeleteNodeProcessor,
  DeleteFileFromStorageProcessor,
  DeleteFileAndChildrenFromStorageProcessor,
  RebuildTreeProcessor,
  SendEmailNotificationProcessor,
];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class ProcessorsModule {}
