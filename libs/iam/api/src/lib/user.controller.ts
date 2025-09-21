import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '@keepcloud/core/services';
import { CurrentUser, Serialize } from '@keepcloud/core/services';
import { User } from '@keepcloud/core/db';
import {
  UserProfileDto,
  PaginationDto,
  UserFilterDto,
} from '@keepcloud/commons/dtos';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Serialize(new PaginationDto(UserProfileDto))
  async findAll(
    @Query() filters: UserFilterDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.findAll(filters, currentUser.id);
  }
}
