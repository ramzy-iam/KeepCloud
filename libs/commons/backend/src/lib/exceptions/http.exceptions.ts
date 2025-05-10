import { HttpStatus } from '@nestjs/common';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class NotFoundException extends AppException {
  constructor(errorCode: string, message: string) {
    super(
      ErrorCode.NOT_FOUND,
      [{ code: errorCode, message }],
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends AppException {
  constructor(errorCode: string, message: string, field?: string) {
    super(
      ErrorCode.CONFLICT,
      [{ code: errorCode, message, field }],
      HttpStatus.CONFLICT,
    );
  }
}

export class BadRequestException extends AppException {
  constructor(errorCode: string, message: string, field?: string) {
    super(
      ErrorCode.BAD_REQUEST,
      [{ code: errorCode, message, field }],
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnauthorizedException extends AppException {
  constructor(errorCode: string, message: string) {
    super(
      ErrorCode.UNAUTHORIZED,
      [{ code: errorCode, message }],
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends AppException {
  constructor(errorCode: string, message: string) {
    super(
      ErrorCode.FORBIDDEN,
      [{ code: errorCode, message }],
      HttpStatus.FORBIDDEN,
    );
  }
}

export class InternalServerErrorException extends AppException {
  constructor(errorCode: string, message: string) {
    super(
      ErrorCode.INTERNAL_SERVER_ERROR,
      [{ code: errorCode, message }],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(errorCode: string, message: string, field?: string) {
    super(
      ErrorCode.SERVICE_UNAVAILABLE,
      [{ code: errorCode, message, field }],
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
