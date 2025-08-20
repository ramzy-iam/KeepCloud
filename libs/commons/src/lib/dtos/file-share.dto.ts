import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from '../validators';
import { ErrorCode } from '../constants';
import { Expose, Type } from 'class-transformer';
import { FileMinViewDto } from './file.dto';

export enum SharePermissionType {
  VIEW = 'VIEW',
  EDIT = 'EDIT', 
  COMMENT = 'COMMENT'
}

export class CreateShareLinkDto {
  @IsOptional()
  @IsEnum(SharePermissionType, { message: 'Permission must be VIEW, EDIT, or COMMENT' })
  permission?: SharePermissionType = SharePermissionType.VIEW;

  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid ISO string' })
  expiresAt?: string;
}

export class UpdateShareLinkDto {
  @IsOptional()
  @IsEnum(SharePermissionType, { message: 'Permission must be VIEW, EDIT, or COMMENT' })
  permission?: SharePermissionType;

  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid ISO string' })
  expiresAt?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean' })
  isPublic?: boolean;
}

export class ShareLinkResponseDto {
  @Expose()
  shareToken: string;

  @Expose()
  shareUrl: string;

  @Expose()
  @Type(() => Date)
  expiresAt?: Date;

  @Expose()
  permission: SharePermissionType;

  @Expose()
  isPublic: boolean;
}

export class SharedFileAccessDto {
  @Expose()
  @Type(() => FileMinViewDto)
  file: FileMinViewDto;

  @Expose()
  permission: SharePermissionType;

  @Expose()
  @Type(() => Date)
  expiresAt?: Date;

  @Expose()
  canDownload: boolean;

  @Expose()
  canView: boolean;
}