import { Clock, UtcTimestamp } from '@tlc/contracts';

export class FakeClock implements Clock {
  private fixed: UtcTimestamp;

  constructor(fixed: Date) {
    this.fixed = new Date(fixed.getTime()) as UtcTimestamp;
  }

  now(): UtcTimestamp {
    return new Date(this.fixed.getTime()) as UtcTimestamp;
  }

  advance(ms: number): void {
    this.fixed = new Date(this.fixed.getTime() + ms) as UtcTimestamp;
  }
}
