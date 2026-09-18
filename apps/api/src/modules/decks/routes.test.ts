import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { deckRoutes } from './routes.js';

vi.mock('../../integrations/scryfall/index.js', () => ({
  searchCards: vi.fn(async () => ({ data: [], totalCards: 0, hasMore: false })),
}));

async function buildApp() {
  const app = Fastify();
  await app.register(deckRoutes);
  return app;
}

describe('POST /api/deck/build', () => {
  it('returns an array of decks, one by default', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/deck/build',
      payload: { colors: ['R'], format: 'standard', style: 'fun' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
  });
});

describe('POST /api/deck/validate', () => {
  it('flags more than 4 copies of the same card once quantities are aggregated', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/deck/validate',
      payload: {
        format: 'standard',
        cards: Array(5).fill('Lightning Bolt'),
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.valid).toBe(false);
    expect(body.errors.some((e: string) => e.includes('5 copies'))).toBe(true);
  });

  it('rejects a malformed body via the shared schema', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/deck/validate',
      payload: { format: 'standard' },
    });

    expect(response.statusCode).toBe(400);
  });
});
