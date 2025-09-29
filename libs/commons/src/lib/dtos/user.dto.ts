import { Expose } from 'class-transformer';
import { MinimalDto, BaseFilterDto } from './base.dto';
import { IsOptional, IsString } from '../validators';

export class UserProfileDto extends MinimalDto {
  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  email: string;

  @Expose()
  picture: string | null;

  @Expose()
  root: string | null;
}

export class UserFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
