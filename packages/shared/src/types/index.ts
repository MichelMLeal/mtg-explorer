// ── MTG Colors ──────────────────────────────────────────────
export const MTG_COLORS = ['W', 'U', 'B', 'R', 'G'] as const;
export type MtgColor = (typeof MTG_COLORS)[number];

export const COLOR_NAMES: Record<MtgColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

// ── Card Legality ───────────────────────────────────────────
export const FORMATS = [
  'standard',
  'pioneer',
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pauper',
  'historic',
  'alchemy',
  'brawl',
  'gladiator',
  'future',
] as const;
export type MtgFormat = (typeof FORMATS)[number];

export type LegalityStatus = 'legal' | 'not_legal' | 'banned' | 'restricted';

// ── Card Rarity ─────────────────────────────────────────────
export const RARITIES = ['common', 'uncommon', 'rare', 'mythic'] as const;
export type MtgRarity = (typeof RARITIES)[number];

// ── Card Type ───────────────────────────────────────────────
export const CARD_TYPES = [
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land',
  'battle',
] as const;
export type CardType = (typeof CARD_TYPES)[number];

// ── Deck Style ──────────────────────────────────────────────
export const DECK_STYLES = ['fun', 'competitive'] as const;
export type DeckStyle = (typeof DECK_STYLES)[number];

// ── Scryfall Card (mapped) ─────────────────────────────────
export interface MtgCard {
  id: string;
  oracleId: string;
  name: string;
  manaCost: string;
  cmc: number;
  typeLine: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors: MtgColor[];
  colorIdentity: MtgColor[];
  keywords: string[];
  setCode: string;
  setName: string;
  rarity: MtgRarity;
  imageUris: CardImageUris;
  prices: CardPrices;
  legalities: Record<MtgFormat, LegalityStatus>;
  edhrecRank?: number;
  artist: string;
  flavorText?: string;
  pricesAvailable: boolean;
}

export interface CardImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  artCrop: string;
  borderCrop: string;
}

export interface CardPrices {
  usd?: string;
  usdFoil?: string;
  eur?: string;
  eurFoil?: string;
  tix?: string;
}

// ── Card Set ────────────────────────────────────────────────
export interface MtgSet {
  code: string;
  name: string;
  setType: string;
  releasedAt?: string;
  cardCount: number;
  iconSvgUri: string;
  block?: string;
}

// ── Deck ────────────────────────────────────────────────────
export interface DeckCard {
  cardId: string;
  cardName: string;
  quantity: number;
  isSideboard: boolean;
}

export interface Deck {
  id: string;
  name: string;
  format: MtgFormat;
  style: DeckStyle;
  colorIdentity: MtgColor[];
  cards: DeckCard[];
  totalCards: number;
  estimatedPrice: number;
  manaCurve: ManaCurve;
  createdAt: string;
}

export interface ManaCurve {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6+': number;
}

// ── Deck Build Request ──────────────────────────────────────
export interface DeckBuildRequest {
  colors: MtgColor[];
  format: MtgFormat;
  style: DeckStyle;
  budget?: number;
  strategy?: string;
}

// ── API Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  totalCards: number;
  hasMore: boolean;
  page: number;
  perPage: number;
}
