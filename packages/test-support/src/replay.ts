export interface ReplayFixture {
  record(name: string, value: number): void;
  replay(name: string): number;
  reset(): void;
}

export function createReplayFixture(): ReplayFixture {
  const recordings = new Map<string, number[]>();
  let currentSequence: string | null = null;
  let index = 0;

  return {
    record: (name: string, value: number): void => {
      if (!recordings.has(name)) {
        recordings.set(name, []);
      }
      recordings.get(name)!.push(value);
    },

    replay: (name: string): number => {
      const seq = recordings.get(name);
      if (!seq || seq.length === 0) {
        throw new Error(`No recorded values for ${name}`);
      }
      if (currentSequence !== name) {
        currentSequence = name;
        index = 0;
      }
      if (index >= seq.length) {
        throw new Error(`Replay exhausted for ${name}`);
      }
      return seq[index++];
    },

    reset: (): void => {
      currentSequence = null;
      index = 0;
    },
  };
}
