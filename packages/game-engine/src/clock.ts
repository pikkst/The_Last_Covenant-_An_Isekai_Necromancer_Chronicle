import { Clock, UtcTimestamp } from '@tlc/contracts';

export class SystemClock implements Clock {
  now(): UtcTimestamp {
    return new Date() as UtcTimestamp;
  }
}
