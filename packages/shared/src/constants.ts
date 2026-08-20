// ── Scryfall API Constants ──────────────────────────────────
export const SCRYFALL_API_BASE = 'https://api.scryfall.com';
export const SCRYFALL_RATE_LIMIT = 10; // requests per second

// ── Cache Keys ──────────────────────────────────────────────
export const CACHE_KEYS = {
  CARD_SEARCH: (q: string, page: number) => `mtg:card:search:${q}:${page}`,
  CARD_DETAIL: (id: string) => `mtg:card:${id}`,
  CARD_BY_NAME: (name: string) => `mtg:card:name:${name.toLowerCase()}`,
  CARD_BY_ARENA: (id: number) => `mtg:card:arena:${id}`,
  SET_LIST: 'mtg:sets:list',
  SET_DETAIL: (code: string) => `mtg:set:${code}`,
  SET_CARDS: (code: string, page: number) => `mtg:set:${code}:cards:${page}`,
  RANDOM_CARD: (seed: string) => `mtg:card:random:${seed}`,
  DECK_BUILD: (hash: string) => `mtg:deck:${hash}`,
  FORMATS: 'mtg:formats',
} as const;

// ── Cache TTLs (seconds) ────────────────────────────────────
export const CACHE_TTL = {
  CARD_SEARCH: 300, // 5 min
  CARD_DETAIL: 600, // 10 min
  SET_LIST: 3600, // 1 hour
  SET_DETAIL: 1800, // 30 min
  RANDOM_CARD: 60, // 1 min
  DECK_BUILD: 1800, // 30 min
  FORMATS: 86400, // 24 hours
} as const;

// ── Rate Limiting ───────────────────────────────────────────
export const RATE_LIMITS = {
  GLOBAL: { max: 100, windowMs: 60_000 },
  SEARCH: { max: 30, windowMs: 60_000 },
  CARD_DETAIL: { max: 120, windowMs: 60_000 },
  DECK_BUILD: { max: 10, windowMs: 60_000 },
} as const;

// ── Deck Building Rules ─────────────────────────────────────
export const DECK_RULES: Record<string, { min: number; max: number; sideboard: number }> = {
  standard: { min: 60, max: 60, sideboard: 15 },
  pioneer: { min: 60, max: 60, sideboard: 15 },
  modern: { min: 60, max: 60, sideboard: 15 },
  legacy: { min: 60, max: 60, sideboard: 15 },
  vintage: { min: 60, max: 60, sideboard: 15 },
  commander: { min: 100, max: 100, sideboard: 0 },
  pauper: { min: 60, max: 60, sideboard: 15 },
  historic: { min: 60, max: 60, sideboard: 15 },
  alchemy: { min: 60, max: 60, sideboard: 15 },
  brawl: { min: 60, max: 60, sideboard: 0 },
  gladiator: { min: 60, max: 60, sideboard: 15 },
  future: { min: 60, max: 60, sideboard: 15 },
};

// ── Mana Curve Targets ──────────────────────────────────────
export const MANA_CURVE_TARGETS: Record<string, Record<string, number>> = {
  aggro: { '0': 4, '1': 12, '2': 10, '3': 8, '4': 4, '5': 2, '6+': 0 },
  control: { '0': 2, '1': 4, '2': 8, '3': 10, '4': 10, '5': 8, '6+': 4 },
  midrange: { '0': 2, '1': 8, '2': 10, '3': 10, '4': 8, '5': 4, '6+': 2 },
  combo: { '0': 4, '1': 6, '2': 8, '3': 8, '4': 6, '5': 4, '6+': 2 },
};
