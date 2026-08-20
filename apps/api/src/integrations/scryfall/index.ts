import type { MtgCard, MtgSet, MtgColor, MtgFormat, MtgRarity } from '@mtg-explorer/shared';
import { scryfallGet } from '../../infrastructure/http/index.js';
import { cacheGet, cacheSet } from '../../infrastructure/cache/index.js';
import { CACHE_KEYS, CACHE_TTL } from '@mtg-explorer/shared';

// ── Scryfall Raw Types (subset we use) ──────────────────────
interface ScryfallCard {
  id: string;
  oracle_id: string;
  name: string;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  set: string;
  set_name: string;
  rarity: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    image_uris?: ScryfallCard['image_uris'];
  }>;
  prices: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
    tix?: string;
  };
  legalities: Record<string, string>;
  edhrec_rank?: number;
  artist: string;
  flavor_text?: string;
}

interface ScryfallListResponse<T> {
  object: 'list';
  data: T[];
  total_cards: number;
  has_more: boolean;
  next_page?: string;
}

interface ScryfallSet {
  object: 'set';
  code: string;
  name: string;
  set_type: string;
  released_at?: string;
  card_count: number;
  icon_svg_uri: string;
  block?: string;
}

// ── Mappers ─────────────────────────────────────────────────

function mapColor(color: string): MtgColor {
  const map: Record<string, MtgColor> = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };
  return map[color] || 'W';
}

function mapCard(scryfall: ScryfallCard): MtgCard {
  // Handle double-faced cards where image_uris is on card_faces
  const imageUris = scryfall.image_uris || scryfall.card_faces?.[0]?.image_uris;

  return {
    id: scryfall.id,
    oracleId: scryfall.oracle_id,
    name: scryfall.name,
    manaCost: scryfall.mana_cost || '',
    cmc: scryfall.cmc,
    typeLine: scryfall.type_line,
    oracleText: scryfall.oracle_text || '',
    power: scryfall.power,
    toughness: scryfall.toughness,
    loyalty: scryfall.loyalty,
    colors: (scryfall.colors || []).map(mapColor),
    colorIdentity: (scryfall.color_identity || []).map(mapColor),
    keywords: scryfall.keywords || [],
    setCode: scryfall.set,
    setName: scryfall.set_name,
    rarity: scryfall.rarity as MtgRarity,
    imageUris: imageUris
      ? {
          small: imageUris.small,
          normal: imageUris.normal,
          large: imageUris.large,
          png: imageUris.png,
          artCrop: imageUris.art_crop,
          borderCrop: imageUris.border_crop,
        }
      : { small: '', normal: '', large: '', png: '', artCrop: '', borderCrop: '' },
    prices: {
      usd: scryfall.prices?.usd || undefined,
      usdFoil: scryfall.prices?.usd_foil || undefined,
      eur: scryfall.prices?.eur || undefined,
      eurFoil: scryfall.prices?.eur_foil || undefined,
      tix: scryfall.prices?.tix || undefined,
    },
    legalities: scryfall.legalities as Record<MtgFormat, any>,
    edhrecRank: scryfall.edhrec_rank,
    artist: scryfall.artist,
    flavorText: scryfall.flavor_text,
    pricesAvailable: Boolean(scryfall.prices?.usd || scryfall.prices?.eur),
  };
}

function mapSet(s: ScryfallSet): MtgSet {
  return {
    code: s.code,
    name: s.name,
    setType: s.set_type,
    releasedAt: s.released_at,
    cardCount: s.card_count,
    iconSvgUri: s.icon_svg_uri,
    block: s.block,
  };
}

// ── Public API ──────────────────────────────────────────────

export async function searchCards(
  query: string,
  page = 1,
  perPage = 20,
): Promise<{ data: MtgCard[]; totalCards: number; hasMore: boolean }> {
  const cacheKey = CACHE_KEYS.CARD_SEARCH(query, page);
  const cached = await cacheGet<{ data: MtgCard[]; totalCards: number; hasMore: boolean }>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
    format: 'json',
  });

  const result = await scryfallGet<ScryfallListResponse<ScryfallCard>>(
    `/cards/search?${params.toString()}`,
  );

  const data = result.data.map(mapCard);
  const response = {
    data,
    totalCards: result.total_cards,
    hasMore: result.has_more,
  };

  await cacheSet(cacheKey, response, CACHE_TTL.CARD_SEARCH);
  return response;
}

export async function getCardById(id: string): Promise<MtgCard | null> {
  const cacheKey = CACHE_KEYS.CARD_DETAIL(id);
  const cached = await cacheGet<MtgCard>(cacheKey);
  if (cached) return cached;

  try {
    const card = await scryfallGet<ScryfallCard>(`/cards/${id}`);
    const mapped = mapCard(card);
    await cacheSet(cacheKey, mapped, CACHE_TTL.CARD_DETAIL);
    return mapped;
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function getCardByName(name: string): Promise<MtgCard | null> {
  const cacheKey = CACHE_KEYS.CARD_BY_NAME(name);
  const cached = await cacheGet<MtgCard>(cacheKey);
  if (cached) return cached;

  try {
    const card = await scryfallGet<ScryfallCard>(
      `/cards/named?fuzzy=${encodeURIComponent(name)}`,
    );
    const mapped = mapCard(card);
    await cacheSet(cacheKey, mapped, CACHE_TTL.CARD_DETAIL);
    return mapped;
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function getCardByArenaId(arenaId: number): Promise<MtgCard | null> {
  const cacheKey = CACHE_KEYS.CARD_BY_ARENA(arenaId);
  const cached = await cacheGet<MtgCard>(cacheKey);
  if (cached) return cached;

  try {
    const card = await scryfallGet<ScryfallCard>(`/cards/arena/${arenaId}`);
    const mapped = mapCard(card);
    await cacheSet(cacheKey, mapped, CACHE_TTL.CARD_DETAIL);
    return mapped;
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function getRandomCard(): Promise<MtgCard> {
  const card = await scryfallGet<ScryfallCard>('/cards/random');
  return mapCard(card);
}

export async function getSets(): Promise<MtgSet[]> {
  const cached = await cacheGet<MtgSet[]>(CACHE_KEYS.SET_LIST);
  if (cached) return cached;

  const result = await scryfallGet<ScryfallListResponse<ScryfallSet>>('/sets');
  const sets = result.data.map(mapSet);
  await cacheSet(CACHE_KEYS.SET_LIST, sets, CACHE_TTL.SET_LIST);
  return sets;
}

export async function getSetCards(
  code: string,
  page = 1,
  perPage = 20,
): Promise<{ data: MtgCard[]; totalCards: number; hasMore: boolean }> {
  const cacheKey = CACHE_KEYS.SET_CARDS(code, page);
  const cached = await cacheGet<{ data: MtgCard[]; totalCards: number; hasMore: boolean }>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: `set:${code}`,
    page: String(page),
    per_page: String(perPage),
    format: 'json',
  });

  const result = await scryfallGet<ScryfallListResponse<ScryfallCard>>(
    `/cards/search?${params.toString()}`,
  );

  const data = result.data.map(mapCard);
  const response = { data, totalCards: result.total_cards, hasMore: result.has_more };
  await cacheSet(cacheKey, response, CACHE_TTL.CARD_DETAIL);
  return response;
}
