import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    field?: string,
  ) {
    super(
      {
        code,
        details: [
          {
            code,
            message,
            ...(field ? { field } : {}),
          },
        ],
      },
      status,
    );
  }

  static create(
    code: string,
    message: string,
    status: HttpStatus,
    field?: string,
  ): AppException {
    return new AppException(code, message, status, field);
  }
}
