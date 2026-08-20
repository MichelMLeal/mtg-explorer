import Pino from 'pino';
import { getEnv } from '../../config/env.js';

const env = getEnv();

export const logger = Pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
      : undefined,
});

export function createScopedLogger(scope: string) {
  return logger.child({ scope });
}
