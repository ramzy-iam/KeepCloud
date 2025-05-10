import { HttpStatus } from '@nestjs/common';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class NotFoundException extends AppException {
  constructor(
    code: string = ErrorCode.NOT_FOUND,
    message = 'Resource not found',
    field?: string,
  ) {
    super(code, message, HttpStatus.NOT_FOUND, field);
  }
}

export class ConflictException extends AppException {
  constructor(
    code: string = ErrorCode.CONFLICT,
    message: string = 'Request conflicts with an existing resource.',
    field?: string,
  ) {
    super(code, message, HttpStatus.CONFLICT, field);
  }
}

export class BadRequestException extends AppException {
  constructor(
    code: string = ErrorCode.BAD_REQUEST,
    message: string = 'Invalid input.',
    field?: string,
  ) {
    super(code, message, HttpStatus.BAD_REQUEST, field);
  }
}

export class UnauthorizedException extends AppException {
  constructor(
    code: string = ErrorCode.UNAUTHORIZED,
    message: string = 'Unauthorized',
  ) {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppException {
  constructor(
    code: string = ErrorCode.FORBIDDEN,
    message: string = 'Access denied.',
  ) {
    super(code, message, HttpStatus.FORBIDDEN);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(
    code: string = ErrorCode.INTERNAL_SERVER_ERROR,
    message: string = 'An unexpected error occurred',
  ) {
    super(code, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(
    code: string = ErrorCode.SERVICE_UNAVAILABLE,
    message: string = 'Service unavailable',
    field?: string,
  ) {
    super(code, message, HttpStatus.SERVICE_UNAVAILABLE, field);
  }
}
