import { AppError } from './types';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    traceId?: string;
    details?: Record<string, unknown>;
  };
}

export function httpStatusForCode(code: string): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'CONFLICT':
      return 409;
    case 'INTERNAL_ERROR':
    default:
      return 500;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
