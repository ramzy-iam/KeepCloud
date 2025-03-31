import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity({ name: 'User' })
export class User extends AppBaseEntity {
  @Column({ nullable: true, default: null })
  firstName: string | null;

  @Column({ nullable: true, default: null })
  lastName: string | null;

  @Column({ unique: true })
  email: string;
}
