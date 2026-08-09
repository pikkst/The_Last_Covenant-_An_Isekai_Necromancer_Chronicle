import { Rng } from '@tlc/contracts';

export function createSeededRng(seed: number): Rng {
  let s = seed >>> 0;
  return {
    next: (): number => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    },
  };
}
