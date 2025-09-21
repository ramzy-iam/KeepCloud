import {
  PaginationDto,
  UserFilterDto,
  UserProfileDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class UserService extends BaseHttpService {
  protected baseUrl = 'users';

  async findAll(filters?: UserFilterDto) {
    return this.get<PaginationDto<UserProfileDto>>('', {
      params: filters,
    });
  }
}

export default new UserService();
