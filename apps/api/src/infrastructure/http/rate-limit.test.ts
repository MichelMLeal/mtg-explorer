import { describe, it, expect, vi } from 'vitest';
import { scryfallGet } from './index.js';

describe('scryfallGet rate limiting', () => {
  it('serializes concurrent calls instead of racing the shared throttle', async () => {
    const callTimes: number[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        callTimes.push(Date.now());
        return { ok: true, json: async () => ({}) } as Response;
      }),
    );

    await Promise.all([scryfallGet('/a'), scryfallGet('/b'), scryfallGet('/c')]);

    expect(callTimes).toHaveLength(3);
    for (let i = 1; i < callTimes.length; i++) {
      // ~100ms slots; small tolerance for timer jitter. Without the fix these
      // would all fire within a few ms of each other.
      expect(callTimes[i] - callTimes[i - 1]).toBeGreaterThanOrEqual(90);
    }

    vi.unstubAllGlobals();
  });
});
