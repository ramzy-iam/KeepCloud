import { Expose, Transform } from 'class-transformer';
import CastHelper from '../helpers/shared/cast.helper';
import { ErrorCode, PAGINATION } from '../constants';
import { SortOrder } from '../types';
import { IsNotEmpty, IsOptional, IsString, Max, Min } from '../validators';

export class BaseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: string | Date;

  @Expose()
  updatedAt: string | Date;
}

export class BaseFilterDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  query?: string | null;

  @Transform(({ value }) =>
    CastHelper.toNumber(value, {
      default: PAGINATION.DEFAULT_PAGE,
      min: PAGINATION.DEFAULT_PAGE,
    }),
  )
  @IsOptional()
  @Min(PAGINATION.DEFAULT_PAGE, ErrorCode.PAGE_INVALID)
  page?: number;

  @Transform(({ value }) =>
    CastHelper.toNumber(value, {
      default: PAGINATION.DEFAULT_PAGE_SIZE,
      min: 1,
      max: PAGINATION.DEFAULT_MAX_PAGE_SIZE,
    }),
  )
  @IsOptional()
  @Min(1, ErrorCode.PAGE_SIZE_INVALID)
  @Max(PAGINATION.DEFAULT_MAX_PAGE_SIZE + 1, ErrorCode.PAGE_SIZE_INVALID)
  pageSize?: number;

  @Transform(({ value }) => CastHelper.toOrder(value))
  @IsOptional()
  order?: SortOrder;

  @Transform(({ value }) => CastHelper.toBoolean(value))
  @IsOptional()
  withDeleted?: boolean;
}
