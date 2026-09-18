import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/cache/index.js', () => ({
  cacheGet: vi.fn(async () => null),
  cacheSet: vi.fn(async () => undefined),
}));

const baseEnv = {
  NODE_ENV: 'test' as const,
  PORT: 3000,
  HOST: '0.0.0.0',
  REDIS_URL: 'redis://localhost:6379',
  SCRYFALL_API_BASE: 'https://api.scryfall.com',
  SCRYFALL_RATE_LIMIT: 10,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW_MS: 60000,
  LOG_LEVEL: 'fatal' as const,
  TOPDECK_API_KEY: 'test-key',
};

vi.mock('../../config/env.js', () => ({
  getEnv: vi.fn(() => baseEnv),
}));

const { getTopDecks, TopDeckNotConfiguredError } = await import('./index.js');

function mockTournament(name: string, standings: Array<Record<string, unknown>>) {
  return { tournamentName: name, startDate: 1700000000, standings };
}

describe('getTopDecks', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns [] for a format TopDeck.gg has no data for', async () => {
    const result = await getTopDecks('alchemy');
    expect(result).toEqual([]);
  });

  it('drops standings with no decklist and ranks the rest by wins, then win rate', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          mockTournament('Event A', [
            { name: 'No Deck Player', wins: 5, losses: 0, draws: 0, deckObj: null },
            {
              name: 'Fewer Wins',
              wins: 3,
              losses: 0,
              draws: 0,
              deckObj: { Mainboard: { 'Lightning Bolt': { count: 4 } } },
            },
            {
              name: 'Best Record',
              wins: 5,
              losses: 0,
              draws: 0,
              deckObj: {
                Mainboard: { 'Ragavan, Nimble Pilferer': { count: 4 } },
                Sideboard: { Pyroblast: { count: 2 } },
              },
            },
            {
              name: 'Same Wins Worse Rate',
              wins: 5,
              losses: 2,
              draws: 0,
              deckObj: { Mainboard: { Counterspell: { count: 4 } } },
            },
          ]),
        ],
      })),
    );

    const result = await getTopDecks('modern');

    expect(result.map((d) => d.playerName)).toEqual(['Best Record', 'Same Wins Worse Rate', 'Fewer Wins']);
    expect(result[0].mainboard).toEqual([{ name: 'Ragavan, Nimble Pilferer', count: 4 }]);
    expect(result[0].sideboard).toEqual([{ name: 'Pyroblast', count: 2 }]);
  });

  it('throws TopDeckNotConfiguredError when no API key is set', async () => {
    const { getEnv } = await import('../../config/env.js');
    vi.mocked(getEnv).mockReturnValueOnce({ ...baseEnv, TOPDECK_API_KEY: undefined });

    await expect(getTopDecks('modern')).rejects.toBeInstanceOf(TopDeckNotConfiguredError);
  });
});
