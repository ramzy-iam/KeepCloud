import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { FileScope } from './file.scope';
import { File } from '../../entities';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(
    @InjectRepository(File)
    private readonly repository: Repository<File>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  get scoped() {
    return new FileScope(this.repository.createQueryBuilder('File'));
  }
}
