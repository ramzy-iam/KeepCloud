import { SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities';

export class UserScope extends SelectQueryBuilder<User> {
  filterById(id: number) {
    return this.andWhere('User.id = :id', {
      id,
    });
  }

  filterByEmail(email: string) {
    return this.andWhere('User.email = :email', {
      email,
    });
  }
}
