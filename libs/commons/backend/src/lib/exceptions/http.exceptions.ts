import { HttpStatus } from '@nestjs/common';
import { AppException, AppExceptionOptions } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class NotFoundException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.NOT_FOUND,
      message: 'Resource not found',
      status: HttpStatus.NOT_FOUND,
    },
  ) {
    super(options);
  }
}

export class ConflictException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.CONFLICT,
      message: 'Request conflicts with an existing resource.',
      status: HttpStatus.CONFLICT,
    },
  ) {
    super(options);
  }
}

export class BadRequestException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.BAD_REQUEST,
      message: 'Invalid input.',
      status: HttpStatus.BAD_REQUEST,
    },
  ) {
    super(options);
  }
}

export class UnauthorizedException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.UNAUTHORIZED,
      message: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
    },
  ) {
    super(options);
  }
}

export class ForbiddenException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.FORBIDDEN,
      message: 'Access denied.',
      status: HttpStatus.FORBIDDEN,
    },
  ) {
    super(options);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  ) {
    super(options);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(
    options: AppExceptionOptions = {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: 'Service unavailable',
      status: HttpStatus.SERVICE_UNAVAILABLE,
    },
  ) {
    super(options);
  }
}
