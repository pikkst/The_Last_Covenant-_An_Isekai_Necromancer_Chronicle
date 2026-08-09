import { IdGenerator, Identifier } from '@tlc/contracts';

export class FakeIdGenerator implements IdGenerator {
  constructor(private counter = 0) {}

  generate(): Identifier {
    return Identifier.create(`test-${this.counter++}`);
  }
}
