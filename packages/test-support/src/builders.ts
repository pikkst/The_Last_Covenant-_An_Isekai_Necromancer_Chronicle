export interface TestBuilder<T> {
  build(): T;
  with<K extends keyof T>(key: K, value: T[K]): TestBuilder<T>;
  reset(): TestBuilder<T>;
}

export function createTestBuilder<T>(initial: T): TestBuilder<T> {
  const initialState = structuredClone(initial);

  const builder = (overrides: Partial<T> = {}): TestBuilder<T> => {
    const state = structuredClone({ ...initialState, ...overrides });

    return {
      build: (): T => structuredClone(state),
      with: <K extends keyof T>(key: K, value: T[K]): TestBuilder<T> => {
        return builder({ ...state, [key]: value });
      },
      reset: (): TestBuilder<T> => builder(),
    };
  };

  return builder();
}
