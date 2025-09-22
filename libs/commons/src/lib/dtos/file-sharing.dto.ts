import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from '../validators';

import { ErrorCode } from '../constants';
import { Expose, Type } from 'class-transformer';
import { FilePermissionRole } from '../types/file-permissions';
import { UserProfileDto } from './user.dto';
import { FileMinViewDto } from './file.dto';

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
  isInherited: boolean;

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
  updatedAt: Date;

  @Expose()
  fileId: string;

  @Expose()
  token: string;

  @Expose()
  role: FilePermissionRole;

  @Expose()
  access: 'restricted' | 'anyone';

  @Expose()
  expiresAt: Date | null;

  @Expose()
  accessCount: number;

  @Expose()
  @Type(() => FileMinViewDto)
  file?: FileMinViewDto;
}

// Alias for backwards compatibility and semantic clarity
export class ShareLinkDto extends FileLinkDto {}

// DTO for creating share links
export class CreateShareLinkDto {
  @IsNotEmpty()
  @IsString()
  fileId: string;

  @IsEnum(FilePermissionRole, ErrorCode.INVALID_PERMISSION_ROLE)
  role: FilePermissionRole;

  access?: 'restricted' | 'anyone' = 'restricted';

  expiresAt?: Date | null;
}

// DTO for updating share links
export class UpdateShareLinkDto {
  @IsNotEmpty()
  @IsString()
  linkId: string;

  @IsEnum(FilePermissionRole, ErrorCode.INVALID_PERMISSION_ROLE)
  role?: FilePermissionRole;

  access?: 'restricted' | 'anyone';

  expiresAt?: Date | null;
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

// DTO for recursive folder sharing response
export class RecursiveFolderSharingDto {
  @Expose()
  @Type(() => FilePermissionDto)
  folderPermissions: FilePermissionDto[];

  @Expose()
  @Type(() => FilePermissionDto)
  descendants: FilePermissionDto[];

  @Expose()
  totalShared: number;
}
