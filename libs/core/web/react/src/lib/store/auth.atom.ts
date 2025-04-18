import { atom } from 'jotai';
import { UserProfileDto } from '@keepcloud/commons/dtos';

export const authState = atom<{
  user: UserProfileDto;
} | null>(null);
