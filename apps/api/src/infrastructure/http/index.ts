import { getEnv } from '../../config/env.js';
import { createScopedLogger } from '../logging/index.js';

const log = createScopedLogger('http');

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface HttpError extends Error {
  status?: number;
  retryAfter?: number;
}

// Ponytail: simple fetch wrapper with retry + timeout, no axios needed
export async function httpGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 10_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    log.debug({ url }, 'http_request');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'MTGExplorer/1.0',
        Accept: 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      const error: HttpError = new Error(`HTTP ${response.status}: ${errorBody}`);
      error.status = response.status;

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        error.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 1;
      }

      throw error;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// Ponytail: same shape as httpGet, only used for Scryfall's /cards/collection
// batch lookup so far - not merged into httpGet to keep that one's signature
// simple for its many GET-only callers.
export async function httpPost<T>(url: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  const { timeout = 10_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'MTGExplorer/1.0',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      const error: HttpError = new Error(`HTTP ${response.status}: ${errorBody}`);
      error.status = response.status;
      throw error;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// Scryfall-specific rate limiter (10 req/s)
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 100; // 10 req/s = 100ms between requests

// Concurrent callers (e.g. building several decks in parallel) used to race:
// each read the same stale `lastRequestTime` before any of them updated it,
// so the throttle below did nothing under concurrency and Scryfall would
// eventually answer with a real 429. Chaining onto `slotQueue` serializes the
// "wait for a slot" step so only one caller resolves it at a time.
let slotQueue: Promise<void> = Promise.resolve();

function reserveSlot(): Promise<void> {
  const slot = slotQueue.then(async () => {
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    lastRequestTime = Date.now();
  });
  slotQueue = slot;
  return slot;
}

export async function scryfallGet<T>(path: string): Promise<T> {
  const env = getEnv();
  const url = `${env.SCRYFALL_API_BASE}${path}`;

  await reserveSlot();

  return httpGet<T>(url, { timeout: 15_000 });
}

export async function scryfallPost<T>(path: string, body: unknown): Promise<T> {
  const env = getEnv();
  const url = `${env.SCRYFALL_API_BASE}${path}`;

  await reserveSlot();

  return httpPost<T>(url, body, { timeout: 15_000 });
}
