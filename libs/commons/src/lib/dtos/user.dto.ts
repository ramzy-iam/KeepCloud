import { Expose } from 'class-transformer';
import { MinimalDto } from './base.dto';

export class UserProfileDto extends MinimalDto {
  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  email: string;

  @Expose()
  picture: string | null;
}
