import { describe, it, expect } from 'vitest';
import { httpStatusForCode, ApiErrorResponse, isAppError } from './http';
import { AppError, ErrorCode } from './types';

describe('http', () => {
  it('maps NOT_FOUND to 404', () => {
    expect(httpStatusForCode('NOT_FOUND')).toBe(404);
  });

  it('maps VALIDATION_ERROR to 400', () => {
    expect(httpStatusForCode('VALIDATION_ERROR')).toBe(400);
  });

  it('maps UNAUTHORIZED to 401', () => {
    expect(httpStatusForCode('UNAUTHORIZED')).toBe(401);
  });

  it('maps FORBIDDEN to 403', () => {
    expect(httpStatusForCode('FORBIDDEN')).toBe(403);
  });

  it('maps CONFLICT to 409', () => {
    expect(httpStatusForCode('CONFLICT')).toBe(409);
  });

  it('maps INTERNAL_ERROR to 500', () => {
    expect(httpStatusForCode('INTERNAL_ERROR')).toBe(500);
  });

  it('maps unknown codes to 500', () => {
    expect(httpStatusForCode('UNKNOWN' as ErrorCode)).toBe(500);
  });

  it('isAppError returns true for AppError', () => {
    const err = new AppError('NOT_FOUND', 'missing');
    expect(isAppError(err)).toBe(true);
  });

  it('isAppError returns false for generic Error', () => {
    expect(isAppError(new Error('oops'))).toBe(false);
  });

  it('ApiErrorResponse shape is valid', () => {
    const res: ApiErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'missing',
        traceId: 'trace-1',
        details: { id: '123' },
      },
    };
    expect(res.error.code).toBe('NOT_FOUND');
  });
});
