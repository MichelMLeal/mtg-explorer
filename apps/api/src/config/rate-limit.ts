import type { FastifyRateLimitOptions } from '@fastify/rate-limit';
import { RATE_LIMITS } from '@mtg-explorer/shared';

export const globalRateLimit: FastifyRateLimitOptions = {
  max: RATE_LIMITS.GLOBAL.max,
  timeWindow: RATE_LIMITS.GLOBAL.windowMs,
  errorResponseBuilder: () => ({
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  }),
};

export const searchRateLimit: FastifyRateLimitOptions = {
  max: RATE_LIMITS.SEARCH.max,
  timeWindow: RATE_LIMITS.SEARCH.windowMs,
};

export const deckBuildRateLimit: FastifyRateLimitOptions = {
  max: RATE_LIMITS.DECK_BUILD.max,
  timeWindow: RATE_LIMITS.DECK_BUILD.windowMs,
};
