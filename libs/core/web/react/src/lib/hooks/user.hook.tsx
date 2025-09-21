import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services';
import {
  PaginationDto,
  UserProfileDto,
  UserFilterDto,
} from '@keepcloud/commons/dtos';
import { ApiErrorData } from '../services';

interface UseGetUsersOptions {
  filters?: UserFilterDto;
  enabled?: boolean;
  staleTime?: number;
}

export const useGetUsers = ({
  filters = {},
  enabled = true,
  staleTime,
}: UseGetUsersOptions = {}) => {
  return useQuery<PaginationDto<UserProfileDto>, ApiErrorData>({
    queryKey: ['users', filters],
    queryFn: () => UserService.findAll(filters),
    enabled,
    staleTime,
  });
};
