interface ExceptionDetail {
  code: string;
  message: string;
  field?: string;
}

export interface AppExceptionOptions {
  code?: string;
  parentCode?: string;
  message?: string;
  status?: number;
  field?: string;
  params?: Record<string, unknown>;
}

export class AppException extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: ExceptionDetail[];
  public readonly timestamp: string;

  constructor({
    code = 'UNKNOWN_ERROR',
    message = 'An unexpected error occurred.',
    status = 500,
    field,
    parentCode,
    params,
  }: AppExceptionOptions) {
    super(message);
    this.code = parentCode ?? code;
    this.status = status;
    this.code = code;
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.details = [
      {
        code,
        message,
        ...(field ? { field } : {}),
        ...(params ? { params } : {}),
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

  static create(options: AppExceptionOptions): AppException {
    return new AppException(options);
  }
}
