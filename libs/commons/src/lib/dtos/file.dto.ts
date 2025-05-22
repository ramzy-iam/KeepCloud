import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsEnum,
  IsOptional,
  IsBoolean,
} from '../validators';
import {
  ContentType,
  ErrorCode,
  FileFormat,
} from '@keepcloud/commons/constants';

import { Expose, Transform, Type } from 'class-transformer';
import { FileType } from '@prisma/client';
import { BaseFilterDto } from './base.dto';
import castHelper from '../helpers/shared/cast.helper';
import { ValueOf } from '../types';
import { UserProfileDto } from './user.dto';

export class CreateFileDto {
  @IsNotEmpty(ErrorCode.FILE_NAME_REQUIRED)
  @IsString()
  name: string;

  @IsNotEmpty(ErrorCode.FILE_FORMAT_REQUIRED)
  @IsEnum(FileFormat, ErrorCode.FILE_FORMAT_INVALID)
  format: FileFormat;

  @IsPositive(ErrorCode.FILE_SIZE_INVALID)
  size: number;

  @IsNotEmpty(ErrorCode.PARENT_ID_REQUIRED)
  @IsString(ErrorCode.PARENT_ID_REQUIRED)
  @IsOptional()
  parentId?: string;
}

export class CreateFolderDto {
  @IsNotEmpty(ErrorCode.FOLDER_NAME_REQUIRED)
  @IsString(ErrorCode.FOLDER_NAME_REQUIRED)
  name: string;

  @IsNotEmpty(ErrorCode.PARENT_ID_REQUIRED)
  @IsString(ErrorCode.PARENT_ID_REQUIRED)
  @IsOptional()
  parentId?: string;

  @IsNotEmpty(ErrorCode.OWNER_ID_REQUIRED)
  @IsString(ErrorCode.OWNER_ID_REQUIRED)
  @IsOptional()
  ownerId?: string;
}

export class RenameFolderDto {
  @IsNotEmpty(ErrorCode.FILE_NAME_REQUIRED)
  @IsString(ErrorCode.FILE_NAME_REQUIRED)
  name: string;
}

export class FileMinViewDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Transform(({ obj }) => obj.size.toString())
  @Expose()
  size: string;

  @Expose()
  format: FileFormat;

  @Expose()
  contentType: string;

  @Expose()
  isFolder: boolean;

  @Expose()
  @Type(() => FileAncestor)
  ancestors: FileAncestor[];

  @Expose()
  @Type(() => FileMinViewDto)
  children: FileMinViewDto[];

  @Expose()
  @Type(() => UserProfileDto)
  owner: UserProfileDto;
}

export class FilePreviewDto extends FileMinViewDto {
  @Expose()
  parentId: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => FileMinViewDto)
  parents: FileMinViewDto[];

  @Expose()
  ownerId: string;

  @Expose()
  storagePath: string | null;
}

export class FileDetailsDto extends FilePreviewDto {}

export class FileAncestor {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code?: string;

  @Expose()
  isSystem?: boolean;
}

export class GetOneFolderQueryDto {
  @Transform(({ value }) => castHelper.toBoolean(value))
  @IsOptional()
  @IsBoolean()
  withAncestors?: boolean;
}

export class FolderFilterDto extends BaseFilterDto {
  @Transform(({ value }) => castHelper.trim(value))
  @IsOptional()
  @IsString()
  parentId?: string | null = null;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(FileFormat, ErrorCode.FILE_FORMAT_INVALID)
  @IsOptional()
  format?: FileFormat;

  @IsEnum(FileType, ErrorCode.FILE_TYPE_INVALID)
  @IsOptional()
  type?: FileType;
}

export class TrashedFileDto extends FileMinViewDto {
  @Expose()
  trashedAt: Date;
}
