import { HttpStatus } from '@nestjs/common';
import { AppException, AppExceptionOptions } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class ConflictException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.CONFLICT,
      message: 'Request conflicts with an existing resource.',
      status: HttpStatus.CONFLICT,
      ...options,
    });
  }
}

export class NotFoundException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: 'Resource not found',
      status: HttpStatus.NOT_FOUND,
      ...options,
    });
  }
}

export class BadRequestException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.BAD_REQUEST,
      message: 'Invalid input.',
      status: HttpStatus.BAD_REQUEST,
      ...options,
    });
  }
}

export class UnauthorizedException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.UNAUTHORIZED,
      message: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
      ...options,
    });
  }
}

export class ForbiddenException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.FORBIDDEN,
      message: 'Access denied.',
      status: HttpStatus.FORBIDDEN,
      ...options,
    });
  }
}

export class InternalServerErrorException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(options: AppExceptionOptions = {}) {
    super({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: 'Service unavailable',
      status: HttpStatus.SERVICE_UNAVAILABLE,
      ...options,
    });
  }
}
