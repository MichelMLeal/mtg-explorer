import { describe, it, expect } from 'vitest';
import { DECK_RULES, MANA_CURVE_TARGETS } from '../src/constants.js';
import { FORMATS, DECK_STYLES, MTG_COLORS } from '../src/types/index.js';

describe('DECK_RULES', () => {
  it('has rules for all formats', () => {
    for (const format of FORMATS) {
      expect(DECK_RULES[format]).toBeDefined();
      expect(DECK_RULES[format].min).toBeGreaterThan(0);
      expect(DECK_RULES[format].max).toBeGreaterThanOrEqual(DECK_RULES[format].min);
    }
  });

  it('commander has 100 cards and no sideboard', () => {
    expect(DECK_RULES.commander.min).toBe(100);
    expect(DECK_RULES.commander.max).toBe(100);
    expect(DECK_RULES.commander.sideboard).toBe(0);
  });

  it('standard has 60 cards and 15 sideboard', () => {
    expect(DECK_RULES.standard.min).toBe(60);
    expect(DECK_RULES.standard.max).toBe(60);
    expect(DECK_RULES.standard.sideboard).toBe(15);
  });
});

describe('MANA_CURVE_TARGETS', () => {
  it('has targets for all archetypes', () => {
    expect(MANA_CURVE_TARGETS.aggro).toBeDefined();
    expect(MANA_CURVE_TARGETS.control).toBeDefined();
    expect(MANA_CURVE_TARGETS.midrange).toBeDefined();
    expect(MANA_CURVE_TARGETS.combo).toBeDefined();
  });

  it('aggro has more low-cost cards', () => {
    const aggro = MANA_CURVE_TARGETS.aggro;
    expect(aggro['1']).toBeGreaterThan(aggro['5']);
  });

  it('control has more high-cost cards', () => {
    const control = MANA_CURVE_TARGETS.control;
    const aggro = MANA_CURVE_TARGETS.aggro;
    expect(control['5']).toBeGreaterThanOrEqual(aggro['5']);
  });
});

describe('Types completeness', () => {
  it('has 5 MTG colors', () => {
    expect(MTG_COLORS).toHaveLength(5);
  });

  it('has all main formats', () => {
    expect(FORMATS.length).toBeGreaterThanOrEqual(8);
  });

  it('has both deck styles', () => {
    expect(DECK_STYLES).toContain('fun');
    expect(DECK_STYLES).toContain('competitive');
  });
});
