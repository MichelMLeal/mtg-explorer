import { z } from 'zod';
import { MTG_COLORS, FORMATS, DECK_STYLES } from '../types/index.js';

// ── Card Search ─────────────────────────────────────────────
export const CardSearchSchema = z.object({
  q: z.string().min(1).max(500).describe('Scryfall search query'),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['name', 'cmc', 'color', 'rarity', 'set', 'edhrec_rank', 'price']).default('name'),
  dir: z.enum(['asc', 'desc']).default('asc'),
});

export type CardSearchParams = z.infer<typeof CardSearchSchema>;

// ── Card Detail ─────────────────────────────────────────────
export const CardParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CardNameSchema = z.object({
  name: z.string().min(1).max(200),
});

export const ArenaIdSchema = z.object({
  arenaId: z.coerce.number().int().positive(),
});

// ── Set ─────────────────────────────────────────────────────
export const SetParamsSchema = z.object({
  code: z.string().length(3).toLowerCase(),
});

// ── Deck Build ──────────────────────────────────────────────
export const DeckBuildSchema = z.object({
  colors: z.array(z.enum(MTG_COLORS)).min(1).max(5),
  format: z.enum(FORMATS),
  style: z.enum(DECK_STYLES),
  budget: z.number().positive().optional(),
  strategy: z.string().max(500).optional(),
});

export type DeckBuildParams = z.infer<typeof DeckBuildSchema>;

// ── Deck Validate ───────────────────────────────────────────
export const DeckValidateSchema = z.object({
  format: z.enum(FORMATS),
  cards: z.array(z.string().min(1).max(200)).min(1).max(100),
});

// ── Pagination ──────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
