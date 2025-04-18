import { Expose } from 'class-transformer';
import { BaseDto } from './base.dto';

export class UserProfileDto extends BaseDto {
  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  email: string;

  @Expose()
  picture: string | null;
}
