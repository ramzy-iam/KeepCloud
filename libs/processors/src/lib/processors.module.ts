import { Global, Module } from '@nestjs/common';
import {
  DeleteFileFromStorageProcessor,
  DeleteNodeProcessor,
  UpdateFileTagInAfterCreateProcessor,
  ProcessorProvider,
  RebuildTreeProcessor,
} from '@keepcloud/core/services';

const services = [
  ProcessorProvider,
  UpdateFileTagInAfterCreateProcessor,
  DeleteNodeProcessor,
  DeleteFileFromStorageProcessor,
  RebuildTreeProcessor,
];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class ProcessorsModule {}
