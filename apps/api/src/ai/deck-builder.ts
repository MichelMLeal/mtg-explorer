import type { MtgCard, MtgColor, MtgFormat, DeckStyle, Deck, DeckCard, ManaCurve } from '@mtg-explorer/shared';
import { DECK_RULES } from '@mtg-explorer/shared';
import { searchCards } from '../integrations/scryfall/index.js';
import { createScopedLogger } from '../infrastructure/logging/index.js';

const log = createScopedLogger('deck-builder');

// ── Strategy Definitions ────────────────────────────────────
interface StrategyProfile {
  name: string;
  creatureRatio: number; // % of non-land cards
  spellRatio: number;
  landCount: number;
  priorities: string[]; // Scryfall search terms
  colorPreference: Record<MtgColor, string[]>; // preferred card traits per color
}

const STRATEGIES: Record<string, StrategyProfile> = {
  aggro: {
    name: 'Aggro',
    creatureRatio: 0.55,
    spellRatio: 0.45,
    landCount: 20,
    priorities: ['t:creature', 'cmc<=3', 'o:haste', 'o:double strike'],
    colorPreference: {
      W: ['o:first strike', 'o:vigilance'],
      U: ['o:flash', 'o:unblockable'],
      B: ['o:deathtouch', 'o:life'],
      R: ['o:haste', 'o:direct damage'],
      G: ['o:trample', 'o:ramp'],
    },
  },
  control: {
    name: 'Control',
    creatureRatio: 0.20,
    spellRatio: 0.80,
    landCount: 26,
    priorities: ['t:instant', 'o:counter', 'o:destroy', 'o:draw'],
    colorPreference: {
      W: ['o:exile', 'o:indestructible'],
      U: ['o:counter', 'o:draw'],
      B: ['o:destroy', 'o:drain'],
      R: ['o:destroy', 'o:damage'],
      G: ['o:destroy target enchantment', 'o:gain life'],
    },
  },
  midrange: {
    name: 'Midrange',
    creatureRatio: 0.40,
    spellRatio: 0.60,
    landCount: 24,
    priorities: ['t:creature', 'cmc>=3', 'cmc<=5'],
    colorPreference: {
      W: ['o:life gain', 'o:exile'],
      U: ['o:draw', 'o:counter'],
      B: ['o:destroy', 'o:draw'],
      R: ['o:damage', 'o:haste'],
      G: ['o:ramp', 'o:trample'],
    },
  },
};

function getColorQuery(colors: MtgColor[]): string {
  return `c:${colors.join('')}`;
}

function getFormatQuery(format: MtgFormat): string {
  return `f:${format}`;
}

function selectStrategy(style: DeckStyle, colors: MtgColor[]): StrategyProfile {
  // ponytail: simple heuristic, upgrade with ML if needed
  if (style === 'competitive') {
    // Prefer control or midrange for competitive
    if (colors.includes('U')) return STRATEGIES.control;
    return STRATEGIES.midrange;
  }
  // Fun = aggro (more creatures, more action)
  return STRATEGIES.aggro;
}

function calculateManaCurve(cards: DeckCard[], allCards: Map<string, MtgCard>): ManaCurve {
  const curve: ManaCurve = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 };

  for (const deckCard of cards) {
    const card = allCards.get(deckCard.cardId);
    if (!card) continue;
    // ponytail: lands have no mana cost, exclude from curve (shown as deck total instead)
    if (card.typeLine.includes('Land')) continue;
    const slot = card.cmc >= 6 ? '6+' : String(Math.floor(card.cmc)) as keyof ManaCurve;
    curve[slot] += deckCard.quantity;
  }

  return curve;
}

// ── Main Deck Builder ───────────────────────────────────────
export async function buildDeck(params: {
  colors: MtgColor[];
  format: MtgFormat;
  style: DeckStyle;
  budget?: number;
  strategy?: string;
}): Promise<Deck> {
  const { colors, format, style, budget } = params;
  const rules = DECK_RULES[format] || { min: 60, max: 60, sideboard: 15 };
  const strategy = selectStrategy(style, colors);

  log.info({ colors, format, style, strategy: strategy.name }, 'building_deck');

  const deckCards: DeckCard[] = [];
  const allCards = new Map<string, MtgCard>();

  // ── 1. Fetch creatures ──────────────────────────────────
  const creatureQuery = [
    getColorQuery(colors),
    getFormatQuery(format),
    't:creature',
    'order:edhrec',
  ].join(' ');

  const creatureResult = await searchCards(creatureQuery, 1, 40);
  const creatureCount = Math.floor(rules.min * strategy.creatureRatio);

  let added = 0;
  for (const card of creatureResult.data) {
    if (added >= creatureCount) break;
    if (budget && card.prices.usd && parseFloat(card.prices.usd) > budget * 0.1) continue;

    const qty = card.rarity === 'mythic' || card.rarity === 'rare' ? 1 : 2;
    if (added + qty > creatureCount) continue;

    deckCards.push({ cardId: card.id, cardName: card.name, quantity: qty, isSideboard: false });
    allCards.set(card.id, card);
    added += qty;
  }

  // ── 2. Fetch spells ─────────────────────────────────────
  const spellQuery = [
    getColorQuery(colors),
    getFormatQuery(format),
    '(t:instant OR t:sorcery OR t:artifact OR t:enchantment OR t:planeswalker)',
    'order:edhrec',
  ].join(' ');

  const spellResult = await searchCards(spellQuery, 1, 40);
  const spellCount = rules.min - creatureCount - strategy.landCount;

  added = 0;
  for (const card of spellResult.data) {
    if (added >= spellCount) break;
    if (deckCards.some((d) => d.cardId === card.id)) continue;
    if (budget && card.prices.usd && parseFloat(card.prices.usd) > budget * 0.15) continue;

    const qty = card.rarity === 'mythic' || card.rarity === 'rare' ? 1 : 2;
    if (added + qty > spellCount) continue;

    deckCards.push({ cardId: card.id, cardName: card.name, quantity: qty, isSideboard: false });
    allCards.set(card.id, card);
    added += qty;
  }

  // ── 3. Fetch lands ──────────────────────────────────────
  const landQuery = [
    't:land',
    getFormatQuery(format),
    'order:edhrec',
  ].join(' ');

  const landResult = await searchCards(landQuery, 1, 30);
  const landCount = strategy.landCount;

  added = 0;
  for (const card of landResult.data) {
    if (added >= landCount) break;
    if (deckCards.some((d) => d.cardId === card.id)) continue;

    const qty = card.name.includes('Dual') || card.name.includes('Fetch') ? 1 : 2;
    if (added + qty > landCount) continue;

    deckCards.push({ cardId: card.id, cardName: card.name, quantity: qty, isSideboard: false });
    allCards.set(card.id, card);
    added += qty;
  }

  // ── 4. Fill remaining slots ─────────────────────────────
  const totalMain = deckCards.reduce((sum, c) => sum + c.quantity, 0);
  const remaining = rules.min - totalMain;

  if (remaining > 0) {
    const fillQuery = [
      getColorQuery(colors),
      getFormatQuery(format),
      't:creature',
      'order:edhrec',
    ].join(' ');

    const fillResult = await searchCards(fillQuery, 2, 20);
    added = 0;
    for (const card of fillResult.data) {
      if (added >= remaining) break;
      if (deckCards.some((d) => d.cardId === card.id)) continue;

      deckCards.push({ cardId: card.id, cardName: card.name, quantity: 1, isSideboard: false });
      allCards.set(card.id, card);
      added += 1;
    }
  }

  // ── 5. Calculate totals ─────────────────────────────────
  const totalCards = deckCards.reduce((sum, c) => sum + c.quantity, 0);
  const estimatedPrice = deckCards.reduce((sum, c) => {
    const card = allCards.get(c.cardId);
    const price = card?.prices.usd ? parseFloat(card.prices.usd) : 0;
    return sum + price * c.quantity;
  }, 0);

  const manaCurve = calculateManaCurve(deckCards, allCards);

  return {
    id: crypto.randomUUID(),
    name: `${strategy.name} ${colors.join('')} ${format}`,
    format,
    style,
    colorIdentity: colors,
    cards: deckCards,
    totalCards,
    estimatedPrice: Math.round(estimatedPrice * 100) / 100,
    manaCurve,
    createdAt: new Date().toISOString(),
  };
}

// ── Deck Validator ──────────────────────────────────────────
export function validateDeck(deck: Deck, format: MtgFormat): { valid: boolean; errors: string[] } {
  const rules = DECK_RULES[format];
  const errors: string[] = [];

  if (!rules) {
    errors.push(`Unknown format: ${format}`);
    return { valid: false, errors };
  }

  const mainCards = deck.cards.filter((c) => !c.isSideboard);
  const sideboardCards = deck.cards.filter((c) => c.isSideboard);
  const mainCount = mainCards.reduce((sum, c) => sum + c.quantity, 0);
  const sideboardCount = sideboardCards.reduce((sum, c) => sum + c.quantity, 0);

  if (mainCount < rules.min || mainCount > rules.max) {
    errors.push(`Main deck must have ${rules.min}-${rules.max} cards, found ${mainCount}`);
  }

  if (rules.sideboard > 0 && sideboardCount > rules.sideboard) {
    errors.push(`Sideboard must have at most ${rules.sideboard} cards, found ${sideboardCount}`);
  }

  // Check for >4 copies (except basic lands in most formats)
  for (const card of mainCards) {
    if (card.quantity > 4 && !card.cardName.includes('Basic')) {
      errors.push(`${card.cardName} has ${card.quantity} copies (max 4)`);
    }
  }

  // Commander: singleton check
  if (format === 'commander') {
    for (const card of mainCards) {
      if (card.quantity > 1) {
        errors.push(`${card.cardName} has ${card.quantity} copies (singleton in Commander)`);
      }
    }
    // Also check for duplicate card names
    const nameCounts = new Map<string, number>();
    for (const card of mainCards) {
      nameCounts.set(card.cardName, (nameCounts.get(card.cardName) || 0) + card.quantity);
    }
    for (const [name, count] of nameCounts) {
      if (count > 1) {
        errors.push(`${name} appears ${count} times (singleton in Commander)`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
