import { FileRepository, File } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseFileService {
  constructor(protected readonly fileRepository: FileRepository) {}

  abstract create(dto: unknown): Promise<File>;

  abstract getOne(...args: unknown[]): Promise<unknown>;
}
