import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserScope } from './user.scope';
import { User } from '../../entities';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  get scoped() {
    return new UserScope(this.repository.createQueryBuilder('User'));
  }
}
