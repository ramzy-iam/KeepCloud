import { NotFoundException } from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
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

  async getOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ id });
    if (!file)
      throw new NotFoundException(ErrorCode.NOT_FOUND, 'Resource not found');
    return file;
  }
}
