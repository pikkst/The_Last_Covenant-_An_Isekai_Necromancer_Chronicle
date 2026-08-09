import { describe, it, expect } from 'vitest';
import { ContentVersionSchema } from './validation';

describe('content-schema', () => {
  it('validates a content version', () => {
    const parsed = ContentVersionSchema.parse({ id: '00000000-0000-0000-0000-000000000000', version: '0.1.0' });
    expect(parsed.version).toBe('0.1.0');
  });
});
