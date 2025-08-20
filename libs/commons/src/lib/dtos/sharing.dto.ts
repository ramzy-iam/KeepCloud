import { IsOptional, IsBoolean, IsNumber, IsNotEmpty, IsString } from '../validators';
import { Expose, Type } from 'class-transformer';

export class ShareFileDto {
  @IsOptional()
  @IsNumber({}, { message: 'Expiry hours must be a number' })
  expiresIn?: number; // Hours until expiry

  @IsOptional()
  @IsBoolean({ message: 'makePublic must be a boolean' })
  makePublic?: boolean;
}

export class SharedFileInfoDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  shareToken: string;

  @Expose()
  shareUrl: string;

  @Expose()
  isPublic: boolean;

  @Expose()
  @Type(() => Date)
  expiresAt?: Date;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}

export class AccessSharedFileDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  contentType: string;

  @Expose()
  size: bigint;

  @Expose()
  isFolder: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  owner?: {
    firstName?: string;
    lastName?: string;
  };
}