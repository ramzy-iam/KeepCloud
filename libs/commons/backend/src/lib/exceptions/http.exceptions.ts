import { HttpStatus } from '@nestjs/common';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class NotFoundException extends AppException {
  constructor(
    code: string = ErrorCode.NOT_FOUND,
    message = 'Resource not found',
    field?: string | undefined,
    parentCode?: string,
  ) {
    super(code, message, HttpStatus.NOT_FOUND, field, parentCode);
  }
}

export class ConflictException extends AppException {
  constructor(
    code: string = ErrorCode.CONFLICT,
    message = 'Request conflicts with an existing resource.',
    field?: string | undefined,
    parentCode?: string,
  ) {
    super(code, message, HttpStatus.CONFLICT, field, parentCode);
  }
}

export class BadRequestException extends AppException {
  constructor(
    code: string = ErrorCode.BAD_REQUEST,
    message = 'Invalid input.',
    field?: string | undefined,
    parentCode?: string,
  ) {
    super(code, message, HttpStatus.BAD_REQUEST, field, parentCode);
  }
}

export class UnauthorizedException extends AppException {
  constructor(code: string = ErrorCode.UNAUTHORIZED, message = 'Unauthorized') {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppException {
  constructor(code: string = ErrorCode.FORBIDDEN, message = 'Access denied.') {
    super(code, message, HttpStatus.FORBIDDEN);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(
    code: string = ErrorCode.INTERNAL_SERVER_ERROR,
    message = 'An unexpected error occurred',
  ) {
    super(code, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(
    code: string = ErrorCode.SERVICE_UNAVAILABLE,
    message = 'Service unavailable',
    field?: string,
  ) {
    super(code, message, HttpStatus.SERVICE_UNAVAILABLE, field);
  }
}
