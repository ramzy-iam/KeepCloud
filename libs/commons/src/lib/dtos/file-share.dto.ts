import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from '../validators';
import { ErrorCode } from '../constants';
import { Expose, Type } from 'class-transformer';
import { UserProfileDto } from './user.dto';
import { FileMinViewDto } from './file.dto';

export enum PermissionType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COMMENT = 'COMMENT'
}

export class CreateFileShareDto {
  @IsNotEmpty(ErrorCode.FILE_ID_REQUIRED)
  @IsString(ErrorCode.FILE_ID_REQUIRED)
  fileId: string;

  @IsNotEmpty(ErrorCode.EMAIL_REQUIRED)
  @IsEmail(ErrorCode.INVALID_EMAIL_FORMAT)
  sharedWithEmail: string;

  @IsOptional()
  @IsEnum(PermissionType, { message: 'Permission must be VIEW, EDIT, or COMMENT' })
  permission?: PermissionType = PermissionType.VIEW;
}

export class UpdateFileShareDto {
  @IsEnum(PermissionType, { message: 'Permission must be VIEW, EDIT, or COMMENT' })
  permission: PermissionType;
}

export class FileShareResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  fileId: string;

  @Expose()
  @Type(() => FileMinViewDto)
  file?: FileMinViewDto;

  @Expose()
  sharedWithId: string;

  @Expose()
  @Type(() => UserProfileDto)
  sharedWith?: UserProfileDto;

  @Expose()
  permission: PermissionType;
}

export class ShareFileWithUserDto {
  @IsNotEmpty(ErrorCode.USER_ID_REQUIRED)
  @IsString(ErrorCode.USER_ID_REQUIRED)
  userId: string;

  @IsOptional()
  @IsEnum(PermissionType, { message: 'Permission must be VIEW, EDIT, or COMMENT' })
  permission?: PermissionType = PermissionType.VIEW;
}