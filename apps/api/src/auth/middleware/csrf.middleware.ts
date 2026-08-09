import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@tlc/contracts';

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const origin = req.headers.origin;
  const host = req.headers.host;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const hostUrl = new URL(`${req.protocol}://${host}`);
      if (originUrl.hostname !== hostUrl.hostname) {
        throw new AppError(ErrorCode.FORBIDDEN, 'CSRF validation failed');
      }
    } catch {
      throw new AppError(ErrorCode.FORBIDDEN, 'CSRF validation failed');
    }
  }

  next();
}
