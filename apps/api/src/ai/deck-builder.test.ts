import { describe, it, expect, vi } from 'vitest';
import type { Deck, MtgCard } from '@mtg-explorer/shared';

function makeCard(overrides: Partial<MtgCard> & { id: string; name: string }): MtgCard {
  return {
    oracleId: overrides.id,
    manaCost: '{1}',
    cmc: 1,
    typeLine: 'Creature — Test',
    oracleText: '',
    colors: [],
    colorIdentity: [],
    keywords: [],
    setCode: 'tst',
    setName: 'Test Set',
    rarity: 'common',
    imageUris: { small: '', normal: '', large: '', png: '' } as MtgCard['imageUris'],
    prices: {},
    legalities: {} as MtgCard['legalities'],
    artist: 'Test',
    pricesAvailable: false,
    ...overrides,
  };
}

vi.mock('../integrations/scryfall/index.js', () => ({
  searchCards: vi.fn(async (query: string) => {
    let pool: MtgCard[];
    if (query.includes('t:creature')) {
      pool = Array.from({ length: 40 }, (_, i) => makeCard({ id: `creature-${i}`, name: `Creature ${i}` }));
    } else if (query.includes('t:land')) {
      pool = Array.from({ length: 30 }, (_, i) =>
        makeCard({ id: `land-${i}`, name: `Land ${i}`, typeLine: 'Land' })
      );
    } else {
      pool = Array.from({ length: 40 }, (_, i) =>
        makeCard({ id: `spell-${i}`, name: `Spell ${i}`, typeLine: 'Instant' })
      );
    }
    return { data: pool, totalCards: pool.length, hasMore: false };
  }),
}));

const { buildDeck, validateDeck } = await import('./deck-builder.js');

function makeDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'test',
    name: 'Test Deck',
    format: 'standard',
    style: 'fun',
    colorIdentity: ['R', 'W'],
    cards: [],
    totalCards: 0,
    estimatedPrice: 0,
    manaCurve: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('validateDeck', () => {
  it('rejects deck with too few cards', () => {
    const deck = makeDeck({
      cards: [
        { cardId: '1', cardName: 'Lightning Bolt', quantity: 4, isSideboard: false },
      ],
    });
    const result = validateDeck(deck, 'standard');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must have'))).toBe(true);
  });

  it('accepts valid 60-card deck', () => {
    const cards = Array.from({ length: 60 }, (_, i) => ({
      cardId: `card-${i}`,
      cardName: `Card ${i}`,
      quantity: 1,
      isSideboard: false,
    }));
    const deck = makeDeck({ cards, totalCards: 60 });
    const result = validateDeck(deck, 'standard');
    expect(result.valid).toBe(true);
  });

  it('rejects >4 copies of a card', () => {
    const cards = Array.from({ length: 60 }, (_, i) => ({
      cardId: `card-${i}`,
      cardName: i === 0 ? 'Lightning Bolt' : `Card ${i}`,
      quantity: i === 0 ? 5 : 1,
      isSideboard: false,
    }));
    const deck = makeDeck({ cards });
    const result = validateDeck(deck, 'standard');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('5 copies'))).toBe(true);
  });

  it('rejects sideboard > 15 in standard', () => {
    const mainCards = Array.from({ length: 60 }, (_, i) => ({
      cardId: `main-${i}`,
      cardName: `Main ${i}`,
      quantity: 1,
      isSideboard: false,
    }));
    const sideCards = Array.from({ length: 16 }, (_, i) => ({
      cardId: `side-${i}`,
      cardName: `Side ${i}`,
      quantity: 1,
      isSideboard: true,
    }));
    const deck = makeDeck({ cards: [...mainCards, ...sideCards] });
    const result = validateDeck(deck, 'standard');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Sideboard'))).toBe(true);
  });

  it('commander rejects duplicate cards', () => {
    const cards = Array.from({ length: 100 }, (_, i) => ({
      cardId: `card-${i}`,
      cardName: i < 2 ? 'Sol Ring' : `Card ${i}`,
      quantity: 1,
      isSideboard: false,
    }));
    const deck = makeDeck({ cards, format: 'commander' });
    const result = validateDeck(deck, 'commander');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('singleton'))).toBe(true);
  });

  it('rejects unknown format', () => {
    const deck = makeDeck();
    const result = validateDeck(deck, 'unknown' as any);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown format'))).toBe(true);
  });
});

describe('buildDeck', () => {
  it('builds a commander deck that passes its own singleton validation', async () => {
    const [deck] = await buildDeck({ colors: ['G'], format: 'commander', style: 'fun' });
    expect(deck.cards.every((c) => c.quantity === 1)).toBe(true);

    const result = validateDeck(deck, 'commander');
    expect(result.errors.some((e) => e.includes('singleton'))).toBe(false);
  });

  it('builds a legal-size standard deck', async () => {
    const [deck] = await buildDeck({ colors: ['R', 'W'], format: 'standard', style: 'fun' });
    const result = validateDeck(deck, 'standard');
    expect(result.errors.some((e) => e.includes('must have'))).toBe(false);
  });

  it('attaches an image to every card', async () => {
    const [deck] = await buildDeck({ colors: ['R', 'W'], format: 'standard', style: 'fun' });
    expect(deck.cards.every((c) => typeof c.imageUri === 'string')).toBe(true);
  });

  it('defaults to a single deck', async () => {
    const decks = await buildDeck({ colors: ['R', 'W'], format: 'standard', style: 'fun' });
    expect(decks).toHaveLength(1);
  });

  it('builds count distinct-strategy decks when count > 1', async () => {
    const decks = await buildDeck({ colors: ['R', 'W'], format: 'standard', style: 'fun', count: 3 });
    expect(decks).toHaveLength(3);
    const names = decks.map((d) => d.name);
    expect(new Set(names).size).toBe(3);
  });
});
