import type { FastifyInstance } from 'fastify';
import { CardSearchSchema, CardParamsSchema, CardNameSchema, ArenaIdSchema } from '@mtg-explorer/shared';
import * as scryfall from '../../integrations/scryfall/index.js';
import { ZodError } from 'zod';

function formatZodError(err: ZodError) {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request parameters',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    },
  };
}

export async function cardRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/cards — Search cards ───────────────────────
  app.get('/api/cards', async (request, reply) => {
    const parsed = CardSearchSchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(formatZodError(parsed.error));

    const { q, page, perPage } = parsed.data;
    const result = await scryfall.searchCards(q, page, perPage);
    return reply.send(result);
  });

  // ── GET /api/cards/random — Random card ─────────────────
  app.get('/api/cards/random', async (_request, reply) => {
    const card = await scryfall.getRandomCard();
    return reply.send({ data: card });
  });

  // ── GET /api/cards/:id — Card by Scryfall ID ────────────
  app.get('/api/cards/:id', async (request, reply) => {
    const parsed = CardParamsSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(formatZodError(parsed.error));

    const card = await scryfall.getCardById(parsed.data.id);
    if (!card) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
    return reply.send(card);
  });

  // ── GET /api/cards/name/:name — Card by name ────────────
  app.get('/api/cards/name/:name', async (request, reply) => {
    const parsed = CardNameSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(formatZodError(parsed.error));

    const card = await scryfall.getCardByName(parsed.data.name);
    if (!card) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
    return reply.send(card);
  });

  // ── GET /api/cards/arena/:arenaId — Card by Arena ID ─────
  app.get('/api/cards/arena/:arenaId', async (request, reply) => {
    const parsed = ArenaIdSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(formatZodError(parsed.error));

    const card = await scryfall.getCardByArenaId(parsed.data.arenaId);
    if (!card) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
    return reply.send(card);
  });
}
