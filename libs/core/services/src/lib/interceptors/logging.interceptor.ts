import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Env, Logger } from '@keepcloud/commons/backend';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RequestLogger');

  // Sensitive fields that should be sanitized in logs
  private readonly sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'creditCard',
    'secret',
    'apiKey',
    'key',
    'authorization',
    'card',
    'ssn',
    'cvv',
    'pin',
    'social',
    'credential',
    'private',
    'security',
    'auth',
    'signature',
    'certificate',
  ];

  // Headers that might contain the public IP address (ordered by preference)
  private readonly ipHeaders = [
    'cf-connecting-ip', // Cloudflare
    'x-client-ip', // General
    'x-forwarded-for', // Standard proxy header
    'x-real-ip', // Nginx
    'x-cluster-client-ip', // GCP
    'forwarded-for', // Alternative format
    'forwarded', // Standard format
    'true-client-ip', // Akamai, Cloudflare
    'x-appengine-user-ip', // Google App Engine
    'fastly-client-ip', // Fastly CDN
  ];

  // PII regex patterns
  private readonly piiPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    phone: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/,
    ssn: /\d{3}[-]?\d{2}[-]?\d{4}/,
    creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/,
  };

  // Configuration for response logging
  private readonly responseLoggingConfig = {
    maxResponseSize: 1000, // Maximum response size to log in bytes
    logResponsesForErrors: true, // Always log responses for errors
    logResponsesForSlowRequests: true, // Log responses for slow requests
    slowRequestThreshold: 2000, // Threshold in ms for slow requests
    includeResponseForPaths: [
      '/api/auth/', // Always log auth endpoints
    ],
    excludeResponseForPaths: [
      '/health', // Never log health checks
    ],
    logOnlyMetadata: [
      // Only log metadata (no body) for these paths
      '/api/users/',
    ],
  };

  /**
   * Generates a unique request ID for tracking requests across logs
   * @returns A unique request ID string
   */
  private generateRequestId(): string {
    return randomUUID();
  }

  /**
   * Checks if a string contains PII patterns
   * @param value The string value to check
   * @returns True if PII is detected, false otherwise
   */
  private isPII(value: string): boolean {
    return Object.values(this.piiPatterns).some((pattern) =>
      pattern.test(value),
    );
  }

  /**
   * Recursively sanitizes objects by removing sensitive fields and PII
   * @param obj The object to sanitize
   * @param depth Current recursion depth to prevent infinite loops
   * @returns The sanitized object
   */
  private sanitizeObject(obj: Record<string, unknown>, depth = 0): void {
    if (!obj || typeof obj !== 'object' || depth > 5) return;

    Object.keys(obj).forEach((key) => {
      // Check if key is in sensitive fields list
      if (
        this.sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        obj[key] = '***';
      }
      // Check for PII in string values
      else if (typeof obj[key] === 'string' && this.isPII(obj[key])) {
        obj[key] = '***';
      }
      // Recursively sanitize nested objects
      else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key] as Record<string, unknown>, depth + 1);
      }
    });
  }

  /**
   * Safely processes data for logging with size checks and sanitization
   * @param data The data to process
   * @returns Processed data or summary for large/binary data
   */
  private processDataForLogging(data: unknown): Record<string, unknown> | null {
    if (!data) return null;

    // Handle binary data
    if (this.isBinaryData(data)) {
      return this.getBinaryDataSummary(data);
    }

    try {
      // Deep clone to avoid modifying original
      const clonedData = JSON.parse(JSON.stringify(data));

      // Check size
      if (JSON.stringify(clonedData).length > 10000) {
        return { message: '[Data too large to log]' };
      }

      // Sanitize if it's an object
      if (typeof clonedData === 'object' && clonedData !== null) {
        this.sanitizeObject(clonedData);
      }

      return clonedData;
    } catch {
      return { error: 'Error processing data for logging' };
    }
  }

  /**
   * Prepares request data (body, params, query) for logging
   * @param body Request body
   * @param params Request params
   * @param query Request query
   * @returns Structured data object or null if no data
   */
  private prepareRequestDataForLogging(
    body: unknown,
    params: unknown,
    query: unknown,
  ): Record<string, unknown> | null {
    const data: Record<string, unknown> = {};
    let hasData = false;

    // Process body
    if (
      body &&
      typeof body === 'object' &&
      Object.keys(body as Record<string, unknown>).length > 0
    ) {
      const processedBody = this.processDataForLogging(body);
      if (processedBody) {
        data.body = processedBody;
        hasData = true;
      }
    }

    // Process params
    if (
      params &&
      typeof params === 'object' &&
      Object.keys(params as Record<string, unknown>).length > 0
    ) {
      const processedParams = this.processDataForLogging(params);
      if (processedParams) {
        data.params = processedParams;
        hasData = true;
      }
    }

    // Process query
    if (
      query &&
      typeof query === 'object' &&
      Object.keys(query as Record<string, unknown>).length > 0
    ) {
      const processedQuery = this.processDataForLogging(query);
      if (processedQuery) {
        data.query = processedQuery;
        hasData = true;
      }
    }

    return hasData ? data : null;
  }

  /**
   * Checks if data is binary (Buffer, ArrayBuffer, Uint8Array, etc.)
   * @param data The data to check
   * @returns True if data is binary, false otherwise
   */
  private isBinaryData(data: unknown): boolean {
    if (Buffer.isBuffer(data)) return true;
    if (data instanceof ArrayBuffer) return true;
    if (data instanceof Uint8Array) return true;

    if (data && typeof data === 'object' && 'buffer' in data) {
      const bufferData = (data as { buffer: unknown }).buffer;
      return bufferData instanceof ArrayBuffer;
    }

    return false;
  }

  /**
   * Gets a summary object for binary data without including the actual content
   * @param data The binary data
   * @returns An object with type, size and message
   */
  private getBinaryDataSummary(data: unknown): Record<string, unknown> {
    let size: number | string = 'unknown';
    let type = 'BinaryData';

    if (Buffer.isBuffer(data)) {
      size = data.length;
      type = 'Buffer';
    } else if (data instanceof ArrayBuffer) {
      size = data.byteLength;
      type = 'ArrayBuffer';
    } else if (data instanceof Uint8Array) {
      size = data.length;
      type = 'Uint8Array';
    } else if (data && typeof data === 'object' && 'buffer' in data) {
      const bufferData = (data as { buffer: unknown }).buffer;
      if (bufferData instanceof ArrayBuffer) {
        size = bufferData.byteLength;
      }
    }

    return {
      type,
      size: `${size} bytes`,
      message: '[Binary content not logged]',
    };
  }

  /**
   * Extracts the client's public IP address from the request
   * @param request Express request object
   * @returns Public IP address string
   */
  private getClientIp(request: Request): string {
    // Try to get IP from headers
    for (const header of this.ipHeaders) {
      const value = request.header(header);
      if (value) {
        // Headers like x-forwarded-for can contain multiple IPs
        // The leftmost one is typically the original client
        const ips = value.split(',');
        return ips[0].trim();
      }
    }

    // Fall back to remoteAddress from the connection
    return request.ip || 'unknown';
  }

  /**
   * Creates a structured log data object
   * @param baseData Base logging information
   * @param additionalData Additional data to include
   * @returns Structured log data object
   */
  private createLogData(
    baseData: Record<string, unknown>,
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      ...baseData,
      ...additionalData,
    };
  }

  /**
   * Determines if response data should be logged based on various criteria
   * @param path Request path
   * @param statusCode Response status code
   * @param responseTime Response time in ms
   * @param dataSize Size of response data
   * @returns Object indicating what should be logged
   */
  private shouldLogResponseData(
    path: string,
    statusCode: number,
    responseTime: number,
    dataSize: number,
  ): { logFullResponse: boolean; logMetadataOnly: boolean; reason: string } {
    // Always log errors
    if (statusCode >= 400) {
      return {
        logFullResponse: true,
        logMetadataOnly: false,
        reason: 'error_response',
      };
    }

    // Check exclusion paths
    if (
      this.responseLoggingConfig.excludeResponseForPaths.some((excludePath) =>
        path.includes(excludePath),
      )
    ) {
      return {
        logFullResponse: false,
        logMetadataOnly: true,
        reason: 'excluded_path',
      };
    }

    // Check metadata-only paths
    if (
      this.responseLoggingConfig.logOnlyMetadata.some((metadataPath) =>
        path.includes(metadataPath),
      )
    ) {
      return {
        logFullResponse: false,
        logMetadataOnly: true,
        reason: 'metadata_only_path',
      };
    }

    // Always log specific important paths
    if (
      this.responseLoggingConfig.includeResponseForPaths.some((includePath) =>
        path.includes(includePath),
      )
    ) {
      return {
        logFullResponse: true,
        logMetadataOnly: false,
        reason: 'important_path',
      };
    }

    // Log slow requests
    if (responseTime >= this.responseLoggingConfig.slowRequestThreshold) {
      return {
        logFullResponse: true,
        logMetadataOnly: false,
        reason: 'slow_request',
      };
    }

    // Check response size
    if (dataSize > this.responseLoggingConfig.maxResponseSize) {
      return {
        logFullResponse: false,
        logMetadataOnly: true,
        reason: 'response_too_large',
      };
    }

    // Default: log metadata only for successful requests
    return {
      logFullResponse: false,
      logMetadataOnly: true,
      reason: 'default_policy',
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!Env.REQUEST_LOGGING_ENABLED) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, body, params, query } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = this.getClientIp(request);
    const now = Date.now();
    const requestId = this.generateRequestId();

    // Get user info
    const user = request.user as { id?: string; userId?: string } | undefined;
    const userId = user ? user.id || user.userId || 'authenticated' : 'public';

    // Prepare request data
    const requestData = this.prepareRequestDataForLogging(body, params, query);

    // Base log data shared across all log entries
    const baseLogData = {
      requestId,
      method,
      path: originalUrl,
      userId,
      ip,
      userAgent,
    };

    // Log incoming request
    const requestLogData = this.createLogData(
      { ...baseLogData, timestamp: new Date().toISOString(), type: 'REQUEST' },
      requestData ? { requestData } : {},
    );

    this.logger.info(
      `Request ${requestId}: ${method} ${originalUrl}`,
      requestLogData,
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          this.logSuccessResponse(context, data, baseLogData, requestData, now);
        },
        error: (error) => {
          this.logErrorResponse(error, baseLogData, requestData, now);
        },
      }),
    );
  }

  /**
   * Logs successful responses
   */
  private logSuccessResponse(
    context: ExecutionContext,
    data: unknown,
    baseLogData: Record<string, unknown>,
    requestData: Record<string, unknown> | null,
    startTime: number,
  ): void {
    const response = context.switchToHttp().getResponse<Response>();
    const { statusCode } = response;
    const responseTime = Date.now() - startTime;
    const path = baseLogData.path as string;

    // Determine response size
    const dataSize = data ? JSON.stringify(data).length : 0;

    // Decide what to log based on intelligent rules
    const loggingDecision = this.shouldLogResponseData(
      path,
      statusCode,
      responseTime,
      dataSize,
    );

    let responseDataToLog: Record<string, unknown> | null = null;

    if (loggingDecision.logFullResponse) {
      responseDataToLog = this.processDataForLogging(data);
    } else if (loggingDecision.logMetadataOnly) {
      // Log only metadata about the response
      responseDataToLog = {
        dataType: typeof data,
        isArray: Array.isArray(data),
        size: `${dataSize} bytes`,
        hasData: !!data,
        loggingReason: loggingDecision.reason,
        ...(Array.isArray(data) ? { itemCount: data.length } : {}),
        ...(data && typeof data === 'object' && data !== null
          ? { keys: Object.keys(data).slice(0, 5) }
          : {}),
      };
    }

    const responseLogData = this.createLogData(
      {
        ...baseLogData,
        timestamp: new Date().toISOString(),
        type: 'RESPONSE',
        status: statusCode,
        responseTime: `${responseTime}ms`,
      },
      {
        ...(requestData ? { requestData } : {}),
        ...(responseDataToLog ? { responseData: responseDataToLog } : {}),
      },
    );

    this.logger.info(
      `Response ${baseLogData.requestId}: ${statusCode} ${baseLogData.method} ${baseLogData.path} (${responseTime}ms) [${loggingDecision.reason}]`,
      responseLogData,
    );
  }

  /**
   * Logs error responses
   */
  private logErrorResponse(
    error: Error & { status?: number; response?: unknown },
    baseLogData: Record<string, unknown>,
    requestData: Record<string, unknown> | null,
    startTime: number,
  ): void {
    const responseTime = Date.now() - startTime;
    const statusCode = error.status || 500;
    const errorResponseData = error.response
      ? this.processDataForLogging(error.response)
      : null;

    const errorLogData = this.createLogData(
      {
        ...baseLogData,
        timestamp: new Date().toISOString(),
        type: 'ERROR',
        status: statusCode,
        responseTime: `${responseTime}ms`,
      },
      {
        error: {
          message: error.message,
          stack: error.stack,
        },
        ...(requestData ? { requestData } : {}),
        ...(errorResponseData ? { errorResponseData } : {}),
      },
    );

    this.logger.error(
      `Error ${baseLogData.requestId}: ${statusCode} ${baseLogData.method} ${baseLogData.path} - ${error.message} (${responseTime}ms)`,
      errorLogData,
    );
  }
}
