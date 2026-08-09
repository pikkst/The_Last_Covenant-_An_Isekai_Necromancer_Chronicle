import { Clock } from '@tlc/contracts';

export class FakeClock implements Clock {
  private fixed: Date;

  constructor(fixed: Date) {
    this.fixed = new Date(fixed.getTime());
  }

  now(): Date {
    return new Date(this.fixed.getTime());
  }

  advance(ms: number): void {
    this.fixed = new Date(this.fixed.getTime() + ms);
  }
}
