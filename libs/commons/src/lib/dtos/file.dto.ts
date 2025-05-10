import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsEnum,
  IsOptional,
} from '../validators';
import { ErrorCode, FileFormat } from '@keepcloud/commons/constants';

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
  parentId: string;
}
