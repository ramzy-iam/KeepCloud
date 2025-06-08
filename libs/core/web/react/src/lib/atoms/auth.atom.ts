import { atom } from 'jotai';
import { UserProfileDto } from '@keepcloud/commons/dtos';

export const authAtom = atom<{
  user: UserProfileDto;
} | null>(null);
