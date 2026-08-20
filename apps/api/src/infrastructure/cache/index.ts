import { Redis } from 'ioredis';
import { getEnv } from '../../config/env.js';
import { createScopedLogger } from '../logging/index.js';

const log = createScopedLogger('redis');

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const env = getEnv();
  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
  });

  client.on('connect', () => log.info('Redis connected'));
  client.on('error', (err: Error) => log.error({ err }, 'Redis error'));

  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}

// ── Cache-Aside Pattern ──────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    if (!data) return null;
    log.debug({ key }, 'cache_hit');
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
    log.debug({ key, ttl: ttlSeconds }, 'cache_set');
  } catch (err) {
    log.warn({ err, key }, 'cache_set_failed');
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) {
      await getRedis().del(...keys);
      log.debug({ pattern, count: keys.length }, 'cache_del');
    }
  } catch (err) {
    log.warn({ err, pattern }, 'cache_del_failed');
  }
}
