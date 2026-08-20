import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import { getEnv } from './config/env.js';
import { globalRateLimit } from './config/rate-limit.js';
import { CORS_ORIGINS } from './config/constants.js';
import { registerHooks } from './shared/hooks.js';
import { registerErrorHandler } from './shared/errors.js';
import { healthRoutes } from './health/routes.js';
import { cardRoutes } from './modules/cards/routes.js';
import { setRoutes } from './modules/sets/routes.js';
import { formatRoutes } from './modules/formats/routes.js';
import { deckRoutes } from './modules/decks/routes.js';
import { closeRedis } from './infrastructure/cache/index.js';
import { createScopedLogger } from './infrastructure/logging/index.js';

const log = createScopedLogger('app');

async function main() {
  const env = getEnv();

  const app = Fastify({
    logger: env.NODE_ENV === 'development',
    trustProxy: true,
  });

  // ── Plugins ──────────────────────────────────────────────
  await app.register(cors, {
    origin: env.NODE_ENV === 'production' ? false : CORS_ORIGINS,
    methods: ['GET', 'POST'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(rateLimit, globalRateLimit);

  // ── Hooks ────────────────────────────────────────────────
  await registerHooks(app);
  await registerErrorHandler(app);

  // ── Routes ───────────────────────────────────────────────
  await app.register(healthRoutes);
  await app.register(cardRoutes);
  await app.register(setRoutes);
  await app.register(formatRoutes);
  await app.register(deckRoutes);

  // ── Start ────────────────────────────────────────────────
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    log.info({ port: env.PORT, host: env.HOST }, 'server_started');
  } catch (err) {
    log.error({ err }, 'server_start_failed');
    process.exit(1);
  }

  // ── Graceful Shutdown ────────────────────────────────────
  const shutdown = async (signal: string) => {
    log.info({ signal }, 'shutting_down');
    await app.close();
    await closeRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
