import { ErrorCode } from '@keepcloud/commons/constants';
import { AxiosError } from 'axios';

interface ApiErrorDetail {
  code?: string;
  message: string;
  field?: string;
}

interface ApiErrorData {
  code: ErrorCode;
  details: ApiErrorDetail[];
}

export interface KeyToInvalidate {
  keysToInvalidate: unknown[][];
}

export type ApiError = AxiosError<ApiErrorData>;
