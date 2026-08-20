// Re-export types from shared package for frontend use
// ponytail: direct import from shared would work but this keeps frontend imports clean

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

export interface MtgSet {
  code: string;
  name: string;
  setType: string;
  releasedAt?: string;
  cardCount: number;
  iconSvgUri: string;
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
}

export interface DeckCard {
  cardId: string;
  cardName: string;
  quantity: number;
  isSideboard: boolean;
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

export type MtgColor = 'W' | 'U' | 'B' | 'R' | 'G';
export type MtgFormat = 'standard' | 'pioneer' | 'modern' | 'legacy' | 'vintage' | 'commander' | 'pauper' | 'historic' | 'alchemy' | 'brawl';
export type MtgRarity = 'common' | 'uncommon' | 'rare' | 'mythic';
export type DeckStyle = 'fun' | 'competitive';
export type LegalityStatus = 'legal' | 'not_legal' | 'banned' | 'restricted';

export const MTG_COLORS: MtgColor[] = ['W', 'U', 'B', 'R', 'G'];
export const COLOR_NAMES: Record<MtgColor, string> = {
  W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green',
};
