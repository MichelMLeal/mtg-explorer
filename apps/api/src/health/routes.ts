import type { FastifyInstance } from 'fastify';
import { getRedis } from '../infrastructure/cache/index.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const startTime = Date.now();

  app.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/ready', async (_request, reply) => {
    const checks: Record<string, string> = {};

    // Redis check
    try {
      await getRedis().ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');
    const status = allOk ? 200 : 503;

    return reply.status(status).send({
      status: allOk ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
