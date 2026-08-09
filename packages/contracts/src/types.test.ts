import { describe, it, expect } from 'vitest';
import {
  AppError,
  ErrorCode,
  Identifier,
  UtcTimestamp,
  Version,
  err,
  ok,
  stableHash,
  stableStringify,
} from './index';

describe('Result', () => {
  it('creates ok result', () => {
    const res = ok('value');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('value');
    }
  });

  it('creates err result', () => {
    const res = err(new Error('fail'));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toBe('fail');
    }
  });
});

describe('AppError', () => {
  it('creates with code and message', () => {
    const err = new AppError(ErrorCode.NOT_FOUND, 'missing');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('missing');
  });

  it('defaults message to code', () => {
    const err = new AppError(ErrorCode.INTERNAL_ERROR);
    expect(err.message).toBe('INTERNAL_ERROR');
  });

  it('preserves cause', () => {
    const cause = new Error('root');
    const err = new AppError(ErrorCode.INTERNAL_ERROR, 'wrapped', cause);
    expect(err.cause).toBe(cause);
  });
});

describe('Identifier', () => {
  it('creates branded identifier', () => {
    const id = Identifier.create('abc-123');
    expect(id).toBe('abc-123');
  });

  it('validates identifier', () => {
    expect(Identifier.validate('valid-id')).toBe(true);
    expect(Identifier.validate('')).toBe(false);
    expect(Identifier.validate(123)).toBe(false);
    expect(Identifier.validate(null)).toBe(false);
  });
});

describe('UtcTimestamp', () => {
  it('creates from Date', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const ts = UtcTimestamp.create(date);
    expect(ts).toBe(date);
  });

  it('creates from ISO string', () => {
    const ts = UtcTimestamp.from('2024-06-15T12:00:00Z');
    expect(ts.toISOString()).toBe('2024-06-15T12:00:00.000Z');
  });

  it('creates from timestamp', () => {
    const ts = UtcTimestamp.from(1704067200000);
    expect(ts.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('throws on invalid input', () => {
    expect(() => UtcTimestamp.from('not-a-date')).toThrow();
  });

  it('rejects offset-less date-time strings', () => {
    expect(() => UtcTimestamp.from('2024-06-15T12:00:00')).toThrow(
      'Offset-less date-time strings are not allowed; use ISO 8601 with Z or explicit offset',
    );
  });

  it('accepts strings with explicit offset', () => {
    const ts = UtcTimestamp.from('2024-06-15T12:00:00+02:00');
    expect(ts.toISOString()).toBe('2024-06-15T10:00:00.000Z');
  });
});

describe('Version', () => {
  it('creates valid semver', () => {
    const v = Version.create('0.1.0');
    expect(v).toBe('0.1.0');
  });

  it('validates semver', () => {
    expect(Version.validate('1.2.3')).toBe(true);
    expect(Version.validate('0.0.1')).toBe(true);
    expect(Version.validate('1.2')).toBe(false);
    expect(Version.validate('v1.2.3')).toBe(false);
    expect(Version.validate(123)).toBe(false);
  });

  it('throws on invalid format', () => {
    expect(() => Version.create('bad')).toThrow();
  });
});

describe('stableStringify', () => {
  it('produces deterministic JSON with sorted keys', () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it('sorts nested object keys', () => {
    const input = { z: { y: 1, x: 2 }, a: 3 };
    expect(stableStringify(input)).toBe('{"a":3,"z":{"x":2,"y":1}}');
  });

  it('handles arrays', () => {
    expect(stableStringify([3, 1, 2])).toBe('[3,1,2]');
  });

  it('handles null and primitives', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify('hello')).toBe('"hello"');
    expect(stableStringify(42)).toBe('42');
  });

  it('serializes dates as ISO strings', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    expect(stableStringify({ at: date })).toBe('{"at":"2024-01-01T00:00:00.000Z"}');
  });

  it('produces different canonical strings for different dates', () => {
    const a = { at: new Date('2024-01-01T00:00:00Z') };
    const b = { at: new Date('2024-01-02T00:00:00Z') };
    expect(stableStringify(a)).not.toBe(stableStringify(b));
  });

  it('throws on unsupported types', () => {
    expect(() => stableStringify(() => {})).toThrow(
      'Unsupported serialization type: function',
    );
    expect(() => stableStringify(Symbol('x'))).toThrow(
      'Unsupported serialization type: symbol',
    );
  });

  it('rejects non-finite numbers', () => {
    expect(() => stableStringify(NaN)).toThrow(
      'Non-finite numbers are not allowed in canonical serialization: NaN',
    );
    expect(() => stableStringify(Infinity)).toThrow(
      'Non-finite numbers are not allowed in canonical serialization: Infinity',
    );
    expect(() => stableStringify(-Infinity)).toThrow(
      'Non-finite numbers are not allowed in canonical serialization: -Infinity',
    );
  });

  it('rejects NaN in objects', () => {
    expect(() => stableStringify({ value: NaN })).toThrow(
      'Non-finite numbers are not allowed in canonical serialization: NaN',
    );
  });
});

describe('stableHash', () => {
  it('produces deterministic output', async () => {
    const a = await stableHash('abc');
    const b = await stableHash('abc');
    expect(a).toBe(b);
  });

  it('produces different output for different inputs', async () => {
    const a = await stableHash('abc');
    const b = await stableHash('abd');
    expect(a).not.toBe(b);
  });

  it('returns a 64-character hex string', async () => {
    const hash = await stableHash('test');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('matches SHA-256 test vector', async () => {
    const hash = await stableHash('');
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
