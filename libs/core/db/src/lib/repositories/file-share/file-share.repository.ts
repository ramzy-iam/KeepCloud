import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { FileShareScope } from './file-share.scope';
import { FileShare } from '../../entities';

@Injectable()
export class FileShareRepository extends Repository<FileShare> {
  constructor(
    @InjectRepository(File)
    private readonly repository: Repository<FileShare>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  get scoped() {
    return new FileShareScope(this.repository.createQueryBuilder('FileShare'));
  }
}
