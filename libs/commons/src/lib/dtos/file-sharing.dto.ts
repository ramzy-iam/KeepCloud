import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from '../validators';

import { ErrorCode } from '../constants';
import { Expose, Type } from 'class-transformer';
import { FilePermissionRole } from '@prisma/client';
import { UserProfileDto } from './user.dto';
import { FileMinViewDto } from './file.dto';

// DTO for sharing a file with a user
export class ShareFileWithUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsEnum(FilePermissionRole, ErrorCode.INVALID_PERMISSION_ROLE)
  role: FilePermissionRole;
}

// DTO for updating file permission
export class UpdateFilePermissionDto {
  @IsEnum(FilePermissionRole, ErrorCode.INVALID_PERMISSION_ROLE)
  role: FilePermissionRole;
}

// Response DTOs
export class FilePermissionDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  fileId: string;

  @Expose()
  userId: string;

  @Expose()
  role: FilePermissionRole;

  @Expose()
  grantedById: string;

  @Expose()
  @Type(() => UserProfileDto)
  user: UserProfileDto;

  @Expose()
  @Type(() => UserProfileDto)
  grantedBy: UserProfileDto;

  @Expose()
  @Type(() => FileMinViewDto)
  file?: FileMinViewDto;
}

export class FileLinkDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  fileId: string;

  @Expose()
  token: string;

  @Expose()
  role: FilePermissionRole;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  @Type(() => FileMinViewDto)
  file?: FileMinViewDto;
}

export class FileSharingInfoDto {
  @Expose()
  @Type(() => FilePermissionDto)
  permissions: FilePermissionDto[];

  @Expose()
  @Type(() => FileLinkDto)
  links: FileLinkDto[];

  @Expose()
  isShared: boolean;

  @Expose()
  totalSharedWith: number;
}

// DTO for bulk sharing operations
export class ShareFileDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString(ErrorCode.INVALID_STRING, { each: true })
  userIds: string[];

  @IsEnum(FilePermissionRole, ErrorCode.INVALID_PERMISSION_ROLE)
  role: FilePermissionRole;
}
