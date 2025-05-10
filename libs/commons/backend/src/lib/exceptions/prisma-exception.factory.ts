import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from './http.exceptions';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

export class PrismaExceptionFactory {
  static fromPrismaError(error: any): AppException {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || ['unknown field'];
        return new ConflictException(
          ErrorCode.CONFLICT,
          `Unique constraint violation on: ${target.join(', ')}`,
        );
      }

      // P2025: Record not found
      if (error.code === 'P2025') {
        return new NotFoundException(
          ErrorCode.NOT_FOUND,
          error.message || 'Record not found',
        );
      }

      if (error.code === 'P2003') {
        return new BadRequestException(
          ErrorCode.INVALID_INPUT,
          `Foreign key constraint failed on field: ${error.meta?.field_name || 'unknown'}`,
        );
      }

      return new InternalServerErrorException(
        ErrorCode.DATABASE_ERROR,
        `Database error: ${error.code} - ${error.message}`,
      );
    }

    if (error instanceof PrismaClientValidationError) {
      return new BadRequestException(
        ErrorCode.INVALID_INPUT,
        `Invalid input data: ${error.message}`,
      );
    }

    return new InternalServerErrorException(
      ErrorCode.DATABASE_ERROR,
      error.message || 'An unexpected database error occurred',
    );
  }
}
