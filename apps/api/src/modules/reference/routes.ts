import type { FastifyInstance } from 'fastify';
import { CatalogParamsSchema } from '@mtg-explorer/shared';
import * as scryfall from '../../integrations/scryfall/index.js';

export async function referenceRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/symbology — Mana/card symbols (WUBRG, tap, etc.) ──
  app.get('/api/symbology', async (_request, reply) => {
    const symbols = await scryfall.getSymbology();
    return reply.send({ data: symbols });
  });

  // ── GET /api/catalog/:name — Scryfall word-list catalogs ────
  app.get('/api/catalog/:name', async (request, reply) => {
    const parsed = CatalogParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
    }

    const values = await scryfall.getCatalog(parsed.data.name);
    return reply.send({ data: values });
  });
}
