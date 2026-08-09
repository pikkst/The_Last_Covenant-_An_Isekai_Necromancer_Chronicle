import { describe, it, expect } from 'vitest';
import { InMemoryMetrics, NoOpMetrics } from './metrics';

describe('metrics', () => {
  describe('NoOpMetrics', () => {
    it('does not throw on counter operations', () => {
      const m = new NoOpMetrics();
      const c = m.counter('reqs', 'requests');
      c.increment();
      c.increment(3);
      c.increment(1, { method: 'GET' });
      expect(m.collect()).toHaveLength(0);
    });

    it('does not throw on gauge operations', () => {
      const m = new NoOpMetrics();
      const g = m.gauge('active', 'active', ['label']);
      g.set(5);
      g.increment();
      g.decrement();
      expect(m.collect()).toHaveLength(0);
    });

    it('does not throw on histogram operations', () => {
      const m = new NoOpMetrics();
      const h = m.histogram('lat', 'latency', [1, 10]);
      h.observe(0.5);
      h.observe(2, { route: '/x' });
      expect(m.collect()).toHaveLength(0);
    });
  });

  describe('InMemoryMetrics', () => {
    it('collects counters', () => {
      const m = new InMemoryMetrics();
      const c = m.counter('reqs', 'requests', ['method']);
      c.increment(1, { method: 'GET' });
      c.increment(2, { method: 'GET' });
      c.increment(1, { method: 'POST' });
      const samples = m.collect();
      expect(samples).toHaveLength(2);
      expect(samples.find((s) => s.labels?.method === 'GET')?.value).toBe(3);
      expect(samples.find((s) => s.labels?.method === 'POST')?.value).toBe(1);
    });

    it('collects gauges', () => {
      const m = new InMemoryMetrics();
      const g = m.gauge('active', 'active', ['name']);
      g.set(5, { name: 'a' });
      g.increment(2, { name: 'a' });
      g.decrement(1, { name: 'a' });
      g.set(10, { name: 'b' });
      const samples = m.collect();
      expect(samples).toHaveLength(2);
      expect(samples.find((s) => s.labels?.name === 'a')?.value).toBe(6);
      expect(samples.find((s) => s.labels?.name === 'b')?.value).toBe(10);
    });

    it('collects histograms', () => {
      const m = new InMemoryMetrics();
      const h = m.histogram('lat', 'latency');
      h.observe(0.1);
      h.observe(0.2);
      h.observe(0.3);
      const samples = m.collect();
      expect(samples).toHaveLength(3);
    });

  it('collects samples with type', () => {
    const m = new InMemoryMetrics();
    m.counter('c', 'help-c').increment();
    m.gauge('g', 'help-g').set(1);
    m.histogram('h', 'help-h').observe(1);
    const samples = m.collect();
    const types = new Set(samples.map((s) => s.type));
    expect(types).toEqual(new Set(['counter', 'gauge', 'histogram']));
  });
  });
});
