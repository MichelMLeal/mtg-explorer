import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { createScopedLogger } from '../infrastructure/logging/index.js';

const log = createScopedLogger('hooks');

export async function registerHooks(app: FastifyInstance): Promise<void> {
  // ── Request ID ───────────────────────────────────────────
  app.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    request.id = requestId;
  });

  // ── Logging ──────────────────────────────────────────────
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        requestId: request.id,
        responseTime: Math.floor(reply.elapsedTime),
      },
      'request_completed',
    );
  });

  // ── Security Headers ─────────────────────────────────────
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    return payload;
  });
}
