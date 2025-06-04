import { Injectable } from '@nestjs/common';
import { MoveFileInAfterCreateProcessor } from './move-file-after-create.processor';
import { ErrorCode, ProcessorAction } from '@keepcloud/commons/constants';
import { AppException } from '@keepcloud/commons/backend';
import { Processor } from '@keepcloud/commons/types';

@Injectable()
export class ProcessorProvider {
  constructor(
    private readonly moveFileInAfterCreateProcessor: MoveFileInAfterCreateProcessor,
  ) {}

  getFromMessage(message: string): Processor {
    const processorMap = new Map<string, Processor>([
      [
        ProcessorAction.MOVE_FILE_AFTER_CREATE,
        this.moveFileInAfterCreateProcessor,
      ],
    ]);

    const processor = processorMap.get(message);
    if (!processor)
      throw AppException.create({
        code: ErrorCode.UNKNOWN_PROCESSOR,
        message: `Unknown processor: ${message}`,
        status: 400,
      });

    return processor;
  }
}
