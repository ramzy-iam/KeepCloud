import { SetMetadata } from '@nestjs/common';

export const BY_PASS_RLS = 'bypassRLS';
export const ByPassRLS = () => SetMetadata(BY_PASS_RLS, true);
