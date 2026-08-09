export interface Counter {
  increment(delta?: number, labels?: Record<string, string>): void;
}

export interface Gauge {
  set(value: number, labels?: Record<string, string>): void;
  increment(delta?: number, labels?: Record<string, string>): void;
  decrement(delta?: number, labels?: Record<string, string>): void;
}

export interface Histogram {
  observe(value: number, labels?: Record<string, string>): void;
}

export interface Metrics {
  counter(name: string, help: string, labels?: string[]): Counter;
  gauge(name: string, help: string, labels?: string[]): Gauge;
  histogram(name: string, help: string, buckets?: number[], labels?: string[]): Histogram;
  collect(): readonly MetricSample[];
}

export interface MetricSample {
  readonly name: string;
  readonly value: number;
  readonly type: 'counter' | 'gauge' | 'histogram';
  readonly labels?: Record<string, string>;
  readonly help?: string;
}

export class NoOpMetrics implements Metrics {
  counter(): Counter {
    return new NoOpCounter();
  }
  gauge(): Gauge {
    return new NoOpGauge();
  }
  histogram(): Histogram {
    return new NoOpHistogram();
  }
  collect(): readonly MetricSample[] {
    return [];
  }
}

class NoOpCounter implements Counter {
  increment(): void {}
}

class NoOpGauge implements Gauge {
  set(): void {}
  increment(): void {}
  decrement(): void {}
}

class NoOpHistogram implements Histogram {
  observe(): void {}
}

export class InMemoryMetrics implements Metrics {
  private counters = new Map<string, Map<string, number>>();
  private gauges = new Map<string, Map<string, number>>();
  private histogramValues = new Map<string, Map<string, number[]>>();
  private readonly labelSets = new Map<string, Set<string>>();

  counter(name: string, _help: string, labels: string[] = []): Counter {
    this.ensureLabelIndex(name);
    return {
      increment: (delta = 1, labelValues?: Record<string, string>) => {
        const key = this.labelKey(labels, labelValues);
        const current = this.counters.get(name)!.get(key) ?? 0;
        this.counters.get(name)!.set(key, current + delta);
      },
    };
  }

  gauge(name: string, _help: string, labels: string[] = []): Gauge {
    this.ensureLabelIndex(name);
    return {
      set: (value: number, labelValues?: Record<string, string>) => {
        const key = this.labelKey(labels, labelValues);
        this.gauges.get(name)!.set(key, value);
      },
      increment: (delta = 1, labelValues?: Record<string, string>) => {
        const key = this.labelKey(labels, labelValues);
        const current = this.gauges.get(name)!.get(key) ?? 0;
        this.gauges.get(name)!.set(key, current + delta);
      },
      decrement: (delta = 1, labelValues?: Record<string, string>) => {
        const key = this.labelKey(labels, labelValues);
        const current = this.gauges.get(name)!.get(key) ?? 0;
        this.gauges.get(name)!.set(key, current - delta);
      },
    };
  }

  histogram(name: string, _help: string, _buckets?: number[], labels: string[] = []): Histogram {
    this.ensureLabelIndex(name);
    return {
      observe: (value: number, labelValues?: Record<string, string>) => {
        const key = this.labelKey(labels, labelValues);
        const arr = this.histogramValues.get(name)!.get(key) ?? [];
        arr.push(value);
        this.histogramValues.get(name)!.set(key, arr);
      },
    };
  }

  collect(): readonly MetricSample[] {
    const samples: MetricSample[] = [];
    for (const [name, map] of this.counters.entries()) {
      for (const [key, value] of map.entries()) {
        samples.push({ name, value, type: 'counter', labels: this.parseLabelKey(key) });
      }
    }
    for (const [name, map] of this.gauges.entries()) {
      for (const [key, value] of map.entries()) {
        samples.push({ name, value, type: 'gauge', labels: this.parseLabelKey(key) });
      }
    }
    for (const [name, map] of this.histogramValues.entries()) {
      for (const [key, values] of map.entries()) {
        for (const v of values) {
          samples.push({ name, value: v, type: 'histogram', labels: this.parseLabelKey(key) });
        }
      }
    }
    return samples;
  }

  private ensureLabelIndex(name: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, new Map());
      this.gauges.set(name, new Map());
      this.histogramValues.set(name, new Map());
      this.labelSets.set(name, new Set());
    }
  }

  private labelKey(labels: string[], values?: Record<string, string>): string {
    if (labels.length === 0) return '';
    return labels
      .map((label) => `${label}=${values?.[label] ?? ''}`)
      .sort()
      .join(',');
  }

  private parseLabelKey(key: string): Record<string, string> | undefined {
    if (!key) return undefined;
    const result: Record<string, string> = {};
    for (const part of key.split(',')) {
      const [label, value] = part.split('=');
      if (label && value !== undefined) {
        result[label] = value;
      }
    }
    return result;
  }
}
