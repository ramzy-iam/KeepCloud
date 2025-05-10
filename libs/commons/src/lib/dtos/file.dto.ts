import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsEnum,
  IsOptional,
} from '../validators';
import { ErrorCode, FileFormat } from '@keepcloud/commons/constants';

import { Expose, Transform, Type } from 'class-transformer';
import { FileType } from '@prisma/client';

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
  @IsString()
  name: string;
}

export class FileMinViewDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: FileType;

  @Transform(({ obj }) => obj.size.toString())
  @Expose()
  size: string;

  @Expose()
  format: FileFormat;
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
  children: FileMinViewDto[];

  @Expose()
  @Type(() => FileMinViewDto)
  parents: FileMinViewDto[];

  @Expose()
  ownerId: string;

  @Expose()
  storagePath: string | null;
}

export class FileDetailsDto extends FilePreviewDto {}

export class GetChildrenResponseDto {
  @Type(() => FileMinViewDto)
  @Expose()
  children: FileMinViewDto[];
}
