import { Controller, Req, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() req: Request extends { user: infer U } ? U : any) {
    const { email, userId: id } = req.user;

    return this.userService.findOne({ email, id });
  }
}
