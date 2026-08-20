import { describe, it, expect } from 'vitest';
import {
  CardSearchSchema,
  CardParamsSchema,
  DeckBuildSchema,
  DeckValidateSchema,
  PaginationSchema,
} from './index.js';
import { MTG_COLORS, FORMATS, DECK_STYLES } from '../types/index.js';

describe('CardSearchSchema', () => {
  it('accepts valid search params', () => {
    const result = CardSearchSchema.safeParse({ q: 'lightning bolt' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });

  it('rejects empty query', () => {
    const result = CardSearchSchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('rejects overly long query', () => {
    const result = CardSearchSchema.safeParse({ q: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepts pagination params', () => {
    const result = CardSearchSchema.safeParse({ q: 'bolt', page: 2, perPage: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.perPage).toBe(50);
    }
  });

  it('rejects perPage > 100', () => {
    const result = CardSearchSchema.safeParse({ q: 'bolt', perPage: 101 });
    expect(result.success).toBe(false);
  });
});

describe('CardParamsSchema', () => {
  it('accepts valid UUID', () => {
    const result = CardParamsSchema.safeParse({ id: '55ba3396-442c-4089-a293-209f362b8a89' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = CardParamsSchema.safeParse({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('DeckBuildSchema', () => {
  it('accepts valid deck build request', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['R', 'W'],
      format: 'standard',
      style: 'competitive',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty colors', () => {
    const result = DeckBuildSchema.safeParse({
      colors: [],
      format: 'standard',
      style: 'fun',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid color', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['X'],
      format: 'standard',
      style: 'fun',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid format', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['R'],
      format: 'invalid_format',
      style: 'fun',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid style', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['R'],
      format: 'standard',
      style: 'turbo',
    });
    expect(result.success).toBe(false);
  });

  it('accepts budget', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['U', 'B'],
      format: 'modern',
      style: 'competitive',
      budget: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative budget', () => {
    const result = DeckBuildSchema.safeParse({
      colors: ['U'],
      format: 'modern',
      style: 'fun',
      budget: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe('PaginationSchema', () => {
  it('uses defaults', () => {
    const result = PaginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });

  it('rejects page < 1', () => {
    const result = PaginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});
