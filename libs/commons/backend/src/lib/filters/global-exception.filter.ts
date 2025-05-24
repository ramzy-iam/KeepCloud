import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../exceptions/base.exception';
import { DatabaseExceptionFactory } from '../exceptions';
import { ErrorCode } from '@keepcloud/commons/constants';
import { RLSContextService } from '@keepcloud/core/db';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logException(exception);

    if (DatabaseExceptionFactory.isDatabaseException(exception)) {
      const appException = DatabaseExceptionFactory.fromError(exception);
      response
        .status(appException.getStatus())
        .json(appException.getResponse());
      return;
    }

    if (exception instanceof AppException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors (BadRequestException with message array)
      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === 'object'
      ) {
        const validationErrors = this.formatValidationErrors(exceptionResponse);
        if (validationErrors.length > 0) {
          response.status(status).json({
            status,
            code: ErrorCode.VALIDATION_ERROR,
            details: validationErrors,
          });
          return;
        }
      }

      // Default HTTP exception handling
      response.status(status).json({
        status,
        code: this.httpStatusToErrorCode(status),
        details: [
          {
            code: this.httpStatusToErrorCode(status),
            message:
              typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || 'An error occurred',
          },
        ],
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      details: [
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
      ],
    });
  }

  private httpStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private logException(exception: unknown) {
    const at = new Date();
    const userId = RLSContextService.userId || 'unknown';
    if (exception instanceof AppException) {
      this.logger.error('Unhandled exception', {
        userId,
        at,
        ...exception,
        ...{ details: exception.details },
        stack: exception.stack,
      });
    } else {
      this.logger.error('Unhandled exception', {
        userId,
        at,
        exception,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }
  }
  private formatValidationErrors(
    exceptionResponse: any,
    parentPath = '',
  ): Array<{ code: string; message: string; path?: string }> {
    const result: Array<{ code: string; message: string; field?: string }> = [];
    const message = exceptionResponse.message;

    if (Array.isArray(message)) {
      message.forEach((error) => {
        if (typeof error === 'string') {
          // Match optional prefix path and JSON string, handling curly braces
          const match = error.match(/^(.*?)(?:[:\s]*)?(\{.*\})$/);
          if (match) {
            const [, pathPrefixRaw, jsonStr] = match;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.code && parsed.message) {
                // Combine the path prefix and the path from the JSON, ensure no double dots
                const prefix = pathPrefixRaw?.trim();
                const parsedPath = parsed.path?.trim();

                // Remove any curly braces from the path if present
                const cleanParsedPath = parsedPath.replace(/[{}]/g, '').trim();

                // Construct full path, avoiding double dots
                let fullPath =
                  prefix && cleanParsedPath
                    ? `${prefix}${cleanParsedPath ? '.' + cleanParsedPath : ''}` // Ensure no double dot
                    : prefix || cleanParsedPath;

                // Replace any occurrence of double dots '..' with a single dot '.'
                fullPath = fullPath.replace(/\.{2,}/g, '.');

                result.push({
                  code: parsed.code,
                  message: parsed.message,
                  field: fullPath,
                });
                return;
              }
            } catch {
              // If parsing fails, fallback to just the raw error string
              result.push({
                code: ErrorCode.INVALID_INPUT,
                message: 'An unexpected error occurred',
              });
              return;
            }
          }

          // If no match or parsing fails, fallback to just the raw error string
          result.push({
            code: ErrorCode.INVALID_INPUT,
            message: error,
          });
          return;
        }

        const isArrayIndex = !isNaN(Number(error.property));
        const propertyPath = parentPath
          ? isArrayIndex
            ? `${parentPath}[${error.property}]`
            : `${parentPath}${parentPath.endsWith('.') ? '' : '.'}${error.property}` // Prevent double dot
          : error.property;

        // Replace any occurrence of double dots '..' with a single dot '.'
        const correctedPropertyPath = propertyPath.replace(/\.{2,}/g, '.');

        if (error.constraints) {
          Object.values(error.constraints).forEach((constraint: any) => {
            try {
              const parsed = JSON.parse(constraint);
              if (parsed.code && parsed.message) {
                result.push({
                  code: parsed.code,
                  message: parsed.message,
                  field: correctedPropertyPath,
                });
              } else {
                result.push({
                  code: ErrorCode.INVALID_INPUT,
                  message: `${correctedPropertyPath} ${constraint}`,
                  field: correctedPropertyPath,
                });
              }
            } catch {
              result.push({
                code: ErrorCode.INVALID_INPUT,
                message: `${correctedPropertyPath} ${constraint}`,
                field: correctedPropertyPath,
              });
            }
          });
        }

        if (error.children && error.children.length > 0) {
          result.push(
            ...this.formatValidationErrors(
              { message: error.children },
              correctedPropertyPath,
            ),
          );
        }
      });
    } else if (typeof message === 'string') {
      result.push({
        code: ErrorCode.INVALID_INPUT,
        message,
      });
    }

    return result;
  }
}
