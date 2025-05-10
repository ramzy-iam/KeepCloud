import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    public readonly details: Array<{
      code: string;
      message: string;
      field?: string;
    }>,
    public readonly statusCode: HttpStatus,
  ) {
    super(
      {
        code,
        details,
      },
      statusCode,
    );
  }

  static create(
    code: string,
    message: string,
    errorCode: string,
    status: HttpStatus,
    field?: string,
  ): AppException {
    return new AppException(
      code,
      [{ code: errorCode, message, field }],
      status,
    );
  }
}
