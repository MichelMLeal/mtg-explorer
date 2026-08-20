import { describe, it, expect } from 'vitest';
import { validateDeck } from './deck-builder.js';
import type { Deck } from '@mtg-explorer/shared';

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
