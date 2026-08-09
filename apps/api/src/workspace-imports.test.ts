import { describe, it, expect } from 'vitest';
import { AppError, Result } from '@tlc/contracts';

describe('workspace package boundary', () => {
  it('imports AppError from @tlc/contracts', () => {
    const err = new AppError('NOT_FOUND', 'missing');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('imports Result type from @tlc/contracts', () => {
    const res: Result<string> = { ok: true, value: 'x' };
    expect(res.ok).toBe(true);
  });
});
