export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

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
