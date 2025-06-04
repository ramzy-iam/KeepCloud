import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { InternalServerErrorException } from './http.exceptions';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

const defaultMessage = 'Something went wrong. Please try again.';

export class DatabaseExceptionFactory {
  static fromError(error: any): AppException {
    return new InternalServerErrorException({
      message: defaultMessage,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    });
  }

  static isDatabaseException(error: any): boolean {
    return (
      error instanceof PrismaClientKnownRequestError ||
      error instanceof PrismaClientValidationError ||
      (error?.name && error.name.startsWith('Prisma'))
    );
  }
}
