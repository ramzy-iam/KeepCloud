import { Global, Module } from '@nestjs/common';
import {
  MoveFileInAfterCreateProcessor,
  ProcessorProvider,
} from '@keepcloud/core/services';

const services = [ProcessorProvider, MoveFileInAfterCreateProcessor];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class ProcessorsModule {}
