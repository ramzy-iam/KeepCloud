import { Expose } from 'class-transformer';

export class UserStorageDto {
  @Expose()
  usedStorage: number; // in bytes

  @Expose()
  totalStorage: number; // in bytes

  @Expose()
  usagePercentage: number;

  @Expose()
  planName: string;
}

export class StorageBreakdownItemDto {
  @Expose()
  type: string;

  @Expose()
  size: number; // in bytes

  @Expose()
  percentage: number;

  @Expose()
  count: number; // number of files
}

export class StorageBreakdownDto {
  @Expose()
  images: StorageBreakdownItemDto;

  @Expose()
  videos: StorageBreakdownItemDto;

  @Expose()
  documents: StorageBreakdownItemDto;

  @Expose()
  audio: StorageBreakdownItemDto;

  @Expose()
  other: StorageBreakdownItemDto;

  @Expose()
  totalFiles: number;

  @Expose()
  totalSize: number; // in bytes
}
