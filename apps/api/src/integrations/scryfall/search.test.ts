import { describe, it, expect, vi } from 'vitest';

vi.mock('../../infrastructure/cache/index.js', () => ({
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
}));

vi.mock('../../infrastructure/http/index.js', () => ({
  scryfallGet: vi.fn(),
}));

const { searchCards } = await import('./index.js');
const { scryfallGet } = await import('../../infrastructure/http/index.js');

describe('searchCards', () => {
  it('returns an empty result instead of throwing when Scryfall has zero matches', async () => {
    vi.mocked(scryfallGet).mockRejectedValueOnce(
      Object.assign(new Error('HTTP 404: not found'), { status: 404 }),
    );
    const result = await searchCards('this matches nothing');
    expect(result).toEqual({ data: [], totalCards: 0, hasMore: false });
  });

  it('translates our order values to the keys Scryfall actually accepts', async () => {
    vi.mocked(scryfallGet).mockResolvedValueOnce({ data: [], total_cards: 0, has_more: false });
    await searchCards('bolt', 1, 20, 'price', 'desc');

    const url = vi.mocked(scryfallGet).mock.calls.at(-1)![0] as string;
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('order')).toBe('usd');
    expect(params.get('dir')).toBe('desc');
  });

  it('translates edhrec_rank to Scryfall\'s edhrec key', async () => {
    vi.mocked(scryfallGet).mockResolvedValueOnce({ data: [], total_cards: 0, has_more: false });
    await searchCards('bolt', 1, 20, 'edhrec_rank');

    const url = vi.mocked(scryfallGet).mock.calls.at(-1)![0] as string;
    expect(new URLSearchParams(url.split('?')[1]).get('order')).toBe('edhrec');
  });
});
