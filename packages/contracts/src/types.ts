export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly cause?: unknown,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export type Identifier = string & { readonly __brand: 'Identifier' };

export const Identifier = {
  create: (value: string): Identifier => value as Identifier,
  validate: (value: unknown): value is Identifier =>
    typeof value === 'string' && value.length > 0,
};

export type UtcTimestamp = Date & { readonly __brand: 'UtcTimestamp' };

export const UtcTimestamp = {
  create: (value: Date): UtcTimestamp => value as UtcTimestamp,
  from: (value: string | number | Date): UtcTimestamp => {
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      if (!value.endsWith('Z') && !/[-+]\d{2}:\d{2}$/.test(value)) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Offset-less date-time strings are not allowed; use ISO 8601 with Z or explicit offset',
        );
      }
      date = new Date(value);
    }
    if (Number.isNaN(date.getTime())) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid timestamp');
    }
    return date as UtcTimestamp;
  },
};

export type Version = string & { readonly __brand: 'Version' };

export const Version = {
  create: (value: string): Version => {
    if (!/^\d+\.\d+\.\d+$/.test(value)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid version format: ${value}`,
      );
    }
    return value as Version;
  },
  validate: (value: unknown): value is Version =>
    typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value),
};

export interface PageRequest {
  cursor?: string;
  limit: number;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface Clock {
  now(): UtcTimestamp;
}

export interface IdGenerator {
  generate(): Identifier;
}

export interface Rng {
  next(): number;
}
