interface ExceptionDetail {
  code: string;
  message: string;
  field?: string;
}

export class AppException extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: ExceptionDetail[];

  constructor(
    code: string,
    message: string,
    status: number,
    field?: string,
    parentCode?: string,
  ) {
    super(message);
    this.code = parentCode ?? code;
    this.status = status;
    this.details = [
      {
        code,
        message,
        ...(field ? { field } : {}),
      },
    ];

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getStatus(): number {
    return this.status;
  }

  getResponse(): object {
    return {
      code: this.code,
      details: this.details,
    };
  }

  static create(
    code: string,
    message: string,
    status: number,
    field?: string,
  ): AppException {
    return new AppException(code, message, status, field);
  }
}
