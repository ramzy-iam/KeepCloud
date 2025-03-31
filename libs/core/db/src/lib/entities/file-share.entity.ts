import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { File } from './file.entity';
import { User } from './user.entity';
import { FilePermission } from '@keepcloud/commons/constants';

@Entity({ name: 'FileShare' })
export class FileShare extends AppBaseEntity {
  @ManyToOne(() => File, (file) => file.fileShares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ManyToOne(() => User, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shareWithId' })
  shareWith: User;

  @Column()
  shareWithId: number;

  @Column({ type: 'enum', enum: FilePermission })
  permission: FilePermission;
}
