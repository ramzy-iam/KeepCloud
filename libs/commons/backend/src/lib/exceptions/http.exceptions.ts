import { HttpStatus } from '@nestjs/common';
import { AppException, AppExceptionOptions } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

type MessageOrOptions = string | AppExceptionOptions;

function resolveOptions(
  defaultCode: ErrorCode,
  defaultMessage: string,
  defaultStatus: HttpStatus,
  input?: MessageOrOptions,
): AppExceptionOptions {
  if (typeof input === 'string') {
    return { code: defaultCode, message: input, status: defaultStatus };
  }
  return {
    code: defaultCode,
    message: defaultMessage,
    status: defaultStatus,
    ...input,
  };
}

export class ConflictException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.CONFLICT,
        'Request conflicts with an existing resource.',
        HttpStatus.CONFLICT,
        input,
      ),
    );
  }
}

export class NotFoundException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.NOT_FOUND,
        'Resource not found',
        HttpStatus.NOT_FOUND,
        input,
      ),
    );
  }
}

export class BadRequestException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.BAD_REQUEST,
        'Invalid input.',
        HttpStatus.BAD_REQUEST,
        input,
      ),
    );
  }
}

export class UnauthorizedException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.UNAUTHORIZED,
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
        input,
      ),
    );
  }
}

export class ForbiddenException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.FORBIDDEN,
        'Access denied.',
        HttpStatus.FORBIDDEN,
        input,
      ),
    );
  }
}

export class InternalServerErrorException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        input,
      ),
    );
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(input?: MessageOrOptions) {
    super(
      resolveOptions(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
        input,
      ),
    );
  }
}
