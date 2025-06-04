import { Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from '../user/user.service'; // adjust path as needed
import { Inject } from '@nestjs/common';
import { UnauthorizedException } from '@keepcloud/commons/backend';

@Injectable()
export class CurrentUserPipe implements PipeTransform {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  async transform(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ id: userId });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
