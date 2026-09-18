import { describe, it, expect, vi } from 'vitest';

vi.mock('../../infrastructure/cache/index.js', () => ({
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
}));

vi.mock('../../infrastructure/http/index.js', () => ({
  scryfallGet: vi.fn(async () => {
    const err = new Error('HTTP 404: not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }),
}));

const { searchCards } = await import('./index.js');

describe('searchCards', () => {
  it('returns an empty result instead of throwing when Scryfall has zero matches', async () => {
    const result = await searchCards('this matches nothing');
    expect(result).toEqual({ data: [], totalCards: 0, hasMore: false });
  });
});
