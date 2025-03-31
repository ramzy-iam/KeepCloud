import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { FileFormat } from '@keepcloud/commons/constants';
import { AppBaseEntity } from './base.entity';
import { User } from './user.entity';
import { FileShare } from './file-share.entity';

@Entity({ name: 'File' })
export class File extends AppBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: FileFormat, nullable: true })
  format: FileFormat | null;

  /**
   * File size in bytes
   */
  @Column({ type: 'bigint', nullable: true })
  size: number;

  /**
   * S3 file path
   */
  @Column({ type: 'varchar', length: 1024 })
  path: string;

  @Column({ type: 'boolean', default: false })
  isFolder: boolean;

  @Column({ nullable: true })
  temporaryDeletedAt: Date | null;

  @Column({ default: false })
  shared: boolean;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  @ManyToOne(() => File, (file) => file.children, { nullable: true })
  parent: File | null;

  @Column()
  parentId: string | null;

  @OneToMany(() => File, (file) => file.parent)
  children: File[];

  @OneToMany(() => FileShare, (sharedFile) => sharedFile.file)
  fileShares: FileShare[];
}
