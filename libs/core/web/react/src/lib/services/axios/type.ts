import { ErrorCode } from '@keepcloud/commons/constants';
import { AxiosError } from 'axios';

interface ApiErrorDetail {
  code?: ErrorCode;
  message: string;
  field?: string;
}

export interface ApiErrorData {
  code: ErrorCode;
  details: ApiErrorDetail[];
}

export interface KeyToInvalidate {
  keysToInvalidate: unknown[][];
}

export type ApiError = ApiErrorData;
export type ApiErrorResponse = AxiosError<ApiError>;
