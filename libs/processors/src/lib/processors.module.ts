import { Global, Module } from '@nestjs/common';
import {
  DeleteFileFromStorageProcessor,
  DeleteFileAndChildrenFromStorageProcessor,
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
  DeleteFileAndChildrenFromStorageProcessor,
  RebuildTreeProcessor,
];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class ProcessorsModule {}
