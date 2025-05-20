import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from './http.exceptions';
import { AppException } from './base.exception';
import { ErrorCode } from '@keepcloud/commons/constants';

const defaultMessage = 'Something went wrong. Please try again.';

export class DatabaseExceptionFactory {
  static fromError(error: any): AppException {
    if (
      error instanceof PrismaClientKnownRequestError ||
      error.name === 'PrismaClientKnownRequestError'
    ) {
      switch (error.code) {
        case 'P1000':
          return new BadRequestException(
            ErrorCode.AUTHENTICATION_FAILED,
            'Authentication failed.',
          );
        case 'P1001':
        case 'P1002':
        case 'P2024':
          return new ServiceUnavailableException(
            ErrorCode.SERVICE_UNAVAILABLE,
            defaultMessage,
          );
        case 'P1003':
        case 'P1014':
        case 'P2001':
        case 'P2021':
        case 'P2022':
        case 'P2025':
          return new NotFoundException(
            ErrorCode.NOT_FOUND,
            'Resource not found.',
          );
        case 'P1008':
        case 'P1011':
        case 'P2023':
        case 'P2027':
        case 'P2035':
          return new InternalServerErrorException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            defaultMessage,
          );
        case 'P1009':
        case 'P2002':
          return new ConflictException(
            ErrorCode.CONFLICT,
            'Request conflicts with an existing resource.',
          );
        case 'P1010':
          return new BadRequestException(
            ErrorCode.AUTHENTICATION_FAILED,
            'Access denied.',
          );
        case 'P2000':
        case 'P2003':
        case 'P2004':
        case 'P2005':
        case 'P2006':
        case 'P2011':
        case 'P2012':
        case 'P2013':
        case 'P2014':
        case 'P2015':
        case 'P2017':
        case 'P2018':
        case 'P2019':
        case 'P2020':
          return new BadRequestException(
            ErrorCode.INVALID_INPUT,
            'Invalid input.',
          );
        case 'P2034':
          return new InternalServerErrorException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            defaultMessage,
          );
        default:
          return new InternalServerErrorException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            defaultMessage,
          );
      }
    }

    if (
      error instanceof PrismaClientValidationError ||
      error.name === 'PrismaClientValidationError'
    ) {
      return new BadRequestException(ErrorCode.INVALID_INPUT, 'Invalid input.');
    }

    if (
      error instanceof PrismaClientUnknownRequestError ||
      error.name === 'PrismaClientUnknownRequestError'
    ) {
      return new InternalServerErrorException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        defaultMessage,
      );
    }

    if (
      error instanceof PrismaClientRustPanicError ||
      error.name === 'PrismaClientRustPanicError'
    ) {
      return new ServiceUnavailableException(
        ErrorCode.SERVICE_UNAVAILABLE,
        defaultMessage,
      );
    }

    if (
      error instanceof PrismaClientInitializationError ||
      error.name === 'PrismaClientInitializationError'
    ) {
      switch (error.errorCode) {
        case 'P1000':
          return new BadRequestException(
            ErrorCode.AUTHENTICATION_FAILED,
            'Authentication failed.',
          );
        case 'P1001':
          return new ServiceUnavailableException(
            ErrorCode.SERVICE_UNAVAILABLE,
            defaultMessage,
          );
        case 'P1003':
          return new NotFoundException(
            ErrorCode.NOT_FOUND,
            'Resource not found.',
          );
        default:
          return new ServiceUnavailableException(
            ErrorCode.SERVICE_UNAVAILABLE,
            defaultMessage,
          );
      }
    }

    // Fallback for unhandled errors
    return new InternalServerErrorException(
      ErrorCode.INTERNAL_SERVER_ERROR,
      defaultMessage,
    );
  }

  static isDatabaseException(error: any): boolean {
    return (
      error instanceof PrismaClientKnownRequestError ||
      error instanceof PrismaClientValidationError ||
      (error?.name && error.name.startsWith('Prisma'))
    );
  }
}
