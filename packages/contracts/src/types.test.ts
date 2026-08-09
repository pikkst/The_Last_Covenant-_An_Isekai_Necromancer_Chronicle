import { describe, it, expect } from 'vitest';
import { AppError, Result } from './types';

describe('contracts', () => {
  it('creates an AppError', () => {
    const err = new AppError('NOT_FOUND', 'missing');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('creates an ok Result', () => {
    const res: Result<string> = { ok: true, value: 'x' };
    expect(res.ok).toBe(true);
  });
});
