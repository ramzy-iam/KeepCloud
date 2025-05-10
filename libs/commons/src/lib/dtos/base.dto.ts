import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import CastHelper from '../helpers/shared/cast.helper';
import { PAGINATION } from '../constants';
import { SortOrder } from '../types';

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
    }),
  )
  @IsOptional()
  @IsPositive()
  @Min(PAGINATION.DEFAULT_PAGE)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @Transform(({ value }) =>
    CastHelper.toNumber(value, {
      default: PAGINATION.DEFAULT_LIMIT,
    }),
  )
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT + 1)
  limit?: number;

  @Transform(({ value }) => CastHelper.toOrder(value))
  @IsOptional()
  order?: SortOrder;

  @Transform(({ value }) => CastHelper.toBoolean(value))
  @IsOptional()
  withDeleted?: boolean;
}
