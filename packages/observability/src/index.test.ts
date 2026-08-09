import { describe, it, expect } from 'vitest';
import { noopLogger } from './index';

describe('observability', () => {
  it('noopLogger does not throw', () => {
    expect(() => noopLogger.log('info', 'hello')).not.toThrow();
  });
});
