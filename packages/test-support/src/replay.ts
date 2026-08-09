export interface ReplayFixture {
  record(name: string, value: number): void;
  replay(name: string): number;
  reset(): void;
}

export function createReplayFixture(): ReplayFixture {
  const recordings = new Map<string, number[]>();
  const cursors = new Map<string, number>();

  return {
    record: (name: string, value: number): void => {
      if (!recordings.has(name)) {
        recordings.set(name, []);
        cursors.set(name, 0);
      }
      recordings.get(name)!.push(value);
    },

    replay: (name: string): number => {
      const seq = recordings.get(name);
      if (!seq || seq.length === 0) {
        throw new Error(`No recorded values for ${name}`);
      }
      const index = cursors.get(name)!;
      if (index >= seq.length) {
        throw new Error(`Replay exhausted for ${name}`);
      }
      cursors.set(name, index + 1);
      return seq[index];
    },

    reset: (): void => {
      for (const key of cursors.keys()) {
        cursors.set(key, 0);
      }
    },
  };
}
