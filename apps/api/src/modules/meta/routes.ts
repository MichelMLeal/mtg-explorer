import type { FastifyInstance } from 'fastify';
import { TopDecksQuerySchema } from '@mtg-explorer/shared';
import { getTopDecks, TopDeckNotConfiguredError } from '../../integrations/topdeck/index.js';

export async function metaRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/meta/top-decks — Recent top-performing decks ─
  app.get('/api/meta/top-decks', async (request, reply) => {
    const parsed = TopDecksQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
    }

    try {
      const decks = await getTopDecks(parsed.data.format);
      return reply.send({ data: decks });
    } catch (err) {
      if (err instanceof TopDeckNotConfiguredError) {
        return reply.status(503).send({
          error: { code: 'NOT_CONFIGURED', message: 'Top Decks is not configured on this server' },
        });
      }
      throw err;
    }
  });
}
