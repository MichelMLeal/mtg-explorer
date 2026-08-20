import type { FastifyInstance } from 'fastify';
import { SetParamsSchema, PaginationSchema } from '@mtg-explorer/shared';
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

export async function setRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/sets — List all sets ────────────────────────
  app.get('/api/sets', async (_request, reply) => {
    const sets = await scryfall.getSets();
    return reply.send({ data: sets, total: sets.length });
  });

  // ── GET /api/sets/:code/cards — Cards in a set ───────────
  app.get('/api/sets/:code/cards', async (request, reply) => {
    const paramsParsed = SetParamsSchema.safeParse(request.params);
    if (!paramsParsed.success) return reply.status(400).send(formatZodError(paramsParsed.error));

    const queryParsed = PaginationSchema.safeParse(request.query);
    if (!queryParsed.success) return reply.status(400).send(formatZodError(queryParsed.error));

    const { code } = paramsParsed.data;
    const { page, perPage } = queryParsed.data;

    const result = await scryfall.getSetCards(code, page, perPage);
    return reply.send(result);
  });
}
