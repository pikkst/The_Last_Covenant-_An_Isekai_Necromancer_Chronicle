import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { AppError, isAppError, httpStatusForCode, ApiErrorResponse } from '@tlc/contracts';
import { createStructuredLogger, createJsonConsoleSink, type LogLevel } from '@tlc/observability';

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = createStructuredLogger({
    sink: createJsonConsoleSink(),
  });

  catch(exception: AppError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = httpStatusForCode(exception.code);

    const traceId = (request as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const spanId = (request as Request & { traceContext?: { spanId?: string } }).traceContext?.spanId;

    const level: LogLevel = status >= 500 ? 'error' : 'warn';
    const logger = createStructuredLogger({
      sink: createJsonConsoleSink(),
      traceContext: traceId ? { traceId, spanId: spanId ?? '' } : undefined,
    });
    logger.log(level, exception.message, {
      code: exception.code,
      cause: exception.cause,
    });

    const body: ApiErrorResponse = {
      error: {
        code: exception.code,
        message: exception.message,
        ...(traceId ? { traceId } : {}),
      },
    };

    response.status(status).json(body);
  }
}

@Catch()
export class GenericExceptionFilter implements ExceptionFilter {
  private readonly logger = createStructuredLogger({
    sink: createJsonConsoleSink(),
  });

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = (request as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const spanId = (request as Request & { traceContext?: { spanId?: string } }).traceContext?.spanId;
    const message = exception.message ?? 'Internal server error';
    const code = isAppError(exception) ? exception.code : 'INTERNAL_ERROR';
    const status = isAppError(exception) ? httpStatusForCode(code) : exception instanceof HttpException ? exception.getStatus() : 500;

    const logger = createStructuredLogger({
      sink: createJsonConsoleSink(),
      traceContext: traceId ? { traceId, spanId: spanId ?? '' } : undefined,
    });
    logger.log('error', message, {
      code,
      stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
    });

    const body: ApiErrorResponse = {
      error: {
        code,
        message: status >= 500 ? 'Internal server error' : message,
        ...(traceId ? { traceId } : {}),
      },
    };

    response.status(status).json(body);
  }
}
