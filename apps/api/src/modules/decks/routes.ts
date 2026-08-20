import type { FastifyInstance } from 'fastify';
import { DeckBuildSchema } from '@mtg-explorer/shared';
import { buildDeck, validateDeck } from '../../ai/deck-builder.js';
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

export async function deckRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /api/deck/build — AI Deck Builder ──────────────
  app.post('/api/deck/build', async (request, reply) => {
    const parsed = DeckBuildSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send(formatZodError(parsed.error));

    const deck = await buildDeck(parsed.data);
    return reply.send({ data: deck });
  });

  // ── POST /api/deck/validate — Validate a deck ────────────
  app.post('/api/deck/validate', async (request, reply) => {
    const body = request.body as { format?: string; cards?: string[] };

    if (!body?.format || !body?.cards) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'format and cards are required' },
      });
    }

    // Build a temporary deck object for validation
    const deck = {
      id: 'temp',
      name: 'Validation',
      format: body.format as any,
      style: 'fun' as const,
      colorIdentity: [] as any[],
      cards: body.cards.map((name) => ({
        cardId: 'temp',
        cardName: name,
        quantity: 1,
        isSideboard: false,
      })),
      totalCards: body.cards.length,
      estimatedPrice: 0,
      manaCurve: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 },
      createdAt: new Date().toISOString(),
    };

    const result = validateDeck(deck, body.format as any);
    return reply.send(result);
  });
}
