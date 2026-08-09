import { IdGenerator, Identifier } from '@tlc/contracts';

export class SystemIdGenerator implements IdGenerator {
  generate(): Identifier {
    return Identifier.create(crypto.randomUUID());
  }
}
