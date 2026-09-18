import type { TopDeckEntry, DeckCardEntry } from '@mtg-explorer/shared';
import { CACHE_KEYS, CACHE_TTL, TOPDECK_FORMATS } from '@mtg-explorer/shared';
import { getEnv } from '../../config/env.js';
import { cacheGet, cacheSet } from '../../infrastructure/cache/index.js';
import { createScopedLogger } from '../../infrastructure/logging/index.js';

const log = createScopedLogger('topdeck');
const TOPDECK_API_BASE = 'https://topdeck.gg/api';

export class TopDeckNotConfiguredError extends Error {
  constructor() {
    super('TOPDECK_API_KEY is not configured');
    this.name = 'TopDeckNotConfiguredError';
  }
}

interface TopDeckStanding {
  name: string;
  wins?: number;
  losses?: number;
  draws?: number;
  deckObj?: {
    Mainboard?: Record<string, { count: number }>;
    Sideboard?: Record<string, { count: number }>;
  } | null;
}

interface TopDeckTournament {
  tournamentName: string;
  startDate: number;
  standings: TopDeckStanding[];
}

function toEntries(section?: Record<string, { count: number }> | null): DeckCardEntry[] {
  if (!section) return [];
  return Object.entries(section).map(([name, { count }]) => ({ name, count }));
}

// Commander alone runs 1000+ small casual pods a month, which makes an
// unscoped query both slow (tens of seconds) and low-signal. A short
// window + a real player-count floor cuts it down to actual sizeable
// events. Every other format sees far less volume, so a wide 30-day
// window with a lighter floor still returns fast and non-empty.
function queryWindowFor(topdeckFormat: string): { last: number; participantMin: number } {
  return topdeckFormat === 'EDH' ? { last: 3, participantMin: 16 } : { last: 30, participantMin: 8 };
}

export async function getTopDecks(format: string, limit = 10): Promise<TopDeckEntry[]> {
  const topdeckFormat = TOPDECK_FORMATS[format];
  if (!topdeckFormat) return [];

  const cacheKey = CACHE_KEYS.TOP_DECKS(format);
  const cached = await cacheGet<TopDeckEntry[]>(cacheKey);
  if (cached) return cached;

  const env = getEnv();
  if (!env.TOPDECK_API_KEY) throw new TopDeckNotConfiguredError();

  const { last, participantMin } = queryWindowFor(topdeckFormat);
  log.info({ format, topdeckFormat, last, participantMin }, 'fetching_top_decks');

  const response = await fetch(`${TOPDECK_API_BASE}/v2/tournaments`, {
    method: 'POST',
    headers: {
      Authorization: env.TOPDECK_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      game: 'Magic: The Gathering',
      format: topdeckFormat,
      last,
      participantMin,
      columns: ['name', 'decklist', 'wins', 'losses', 'draws'],
    }),
    // This is a large, infrequent (6h-cached), background-ish fetch, not a
    // fast lookup - give it real room before giving up.
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`TopDeck.gg HTTP ${response.status}: ${body}`);
  }

  const tournaments = (await response.json()) as TopDeckTournament[];

  const entries: TopDeckEntry[] = [];
  for (const tournament of tournaments) {
    for (const standing of tournament.standings ?? []) {
      const mainboard = toEntries(standing.deckObj?.Mainboard);
      if (mainboard.length === 0) continue;

      entries.push({
        playerName: standing.name,
        tournamentName: tournament.tournamentName,
        tournamentDate: new Date(tournament.startDate * 1000).toISOString(),
        wins: standing.wins ?? 0,
        losses: standing.losses ?? 0,
        draws: standing.draws ?? 0,
        mainboard,
        sideboard: toEntries(standing.deckObj?.Sideboard),
      });
    }
  }

  // ponytail: rank by raw wins (then win rate as a tiebreak) rather than
  // clustering into archetypes - simplest read on "what's doing well lately".
  entries.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const rateA = a.wins / Math.max(1, a.wins + a.losses + a.draws);
    const rateB = b.wins / Math.max(1, b.wins + b.losses + b.draws);
    return rateB - rateA;
  });

  const top = entries.slice(0, limit);
  await cacheSet(cacheKey, top, CACHE_TTL.TOP_DECKS);
  return top;
}
