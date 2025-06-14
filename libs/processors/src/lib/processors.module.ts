import { Global, Module } from '@nestjs/common';
import {
  DeleteFileFromStorageProcessor,
  DeleteNodeProcessor,
  MoveFileInAfterCreateProcessor,
  ProcessorProvider,
  RebuildTreeProcessor,
} from '@keepcloud/core/services';

const services = [
  ProcessorProvider,
  MoveFileInAfterCreateProcessor,
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
