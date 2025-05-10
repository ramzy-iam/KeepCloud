import { FileRepository, File } from '@keepcloud/core/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseFileService {
  constructor(protected readonly fileRepository: FileRepository) {}

  abstract create(dto: unknown): Promise<File>;

  rename(id: string, name: string): Promise<File> {
    return this.fileRepository.update({ id }, { name });
  }

  delete(id: string): Promise<unknown> {
    return this.fileRepository.update({ id }, { trashedAt: new Date() });
  }

  restore(id: string): Promise<File> {
    return this.fileRepository.update({ id }, { trashedAt: null });
  }

  abstract getOne(id: string): Promise<unknown>;
}
