import type { FastifyInstance } from 'fastify';
import { FORMATS, DECK_RULES } from '@mtg-explorer/shared';
import { cacheGet, cacheSet } from '../../infrastructure/cache/index.js';
import { CACHE_KEYS, CACHE_TTL } from '@mtg-explorer/shared';

export async function formatRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/formats — List all formats with rules ───────
  app.get('/api/formats', async (_request, reply) => {
    const cached = await cacheGet(CACHE_KEYS.FORMATS);
    if (cached) return reply.send(cached);

    const formats = FORMATS.map((f) => ({
      id: f,
      name: f.charAt(0).toUpperCase() + f.slice(1),
      deckRules: DECK_RULES[f] || { min: 60, max: 60, sideboard: 15 },
    }));

    await cacheSet(CACHE_KEYS.FORMATS, { data: formats }, CACHE_TTL.FORMATS);
    return reply.send({ data: formats });
  });
}
