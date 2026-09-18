import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MtgColor, MtgFormat, DeckStyle } from '../lib/types';
import ManaFilter from '../components/ManaFilter';
import DeckCardRow from '../components/DeckCardRow';
import { useBuildDeck } from '../hooks/useCards';

const FORMATS: MtgFormat[] = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'brawl',
];

const STYLE_OPTIONS: { value: DeckStyle; label: string; icon: string }[] = [
  { value: 'fun', label: 'Fun / Casual', icon: '🎉' },
  { value: 'competitive', label: 'Competitive', icon: '🏆' },
];

export default function DeckBuilderPage() {
  const location = useLocation();
  const [importedDeck, setImportedDeck] = useState<any>((location.state as any)?.importedDeck ?? null);
  const [colors, setColors] = useState<MtgColor[]>([]);
  const [format, setFormat] = useState<MtgFormat>('standard');
  const [style, setStyle] = useState<DeckStyle>('fun');
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [count, setCount] = useState(1);

  const { data, isPending, error, mutate } = useBuildDeck();

  const decks = data?.data || [];

  const handleBuild = () => {
    if (colors.length > 0) {
      mutate({ colors, format, style, budget, count });
    }
  };

  return (
    <div className="deck-builder">
      <h1>AI Deck Builder</h1>
      <p className="deck-builder-subtitle">
        Choose your colors, format, and playstyle — the AI builds a deck for you
      </p>

      <div className="deck-builder-config">
        <div className="config-section">
          <h3>Colors</h3>
          <ManaFilter selected={colors} onChange={setColors} />
        </div>

        <div className="config-section">
          <h3>Format</h3>
          <select
            className="select-input"
            value={format}
            onChange={(e) => setFormat(e.target.value as MtgFormat)}
          >
            {FORMATS.map((f: MtgFormat) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="config-section">
          <h3>Playstyle</h3>
          <div className="style-buttons">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`style-button ${style === opt.value ? 'selected' : ''}`}
                onClick={() => setStyle(opt.value)}
                type="button"
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3>Budget (optional)</h3>
          <input
            type="number"
            className="number-input"
            placeholder="Max total $"
            value={budget || ''}
            onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="config-section">
          <h3>How many decks</h3>
          <div className="style-buttons">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`style-button ${count === n ? 'selected' : ''}`}
                onClick={() => setCount(n)}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-build"
          onClick={handleBuild}
          disabled={colors.length === 0 || isPending}
        >
          {isPending ? 'Building...' : '⚡ Build Deck'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error instanceof Error ? error.message : 'Failed to build deck'}
        </div>
      )}

      {decks.map((deck: any, deckIndex: number) => (
        <div className="deck-result" key={deck.id || deckIndex}>
          <div className="deck-header">
            <h2>{deck.name}</h2>
            <div className="deck-stats">
              <span>{deck.totalCards} cards</span>
              <span>${deck.estimatedPrice}</span>
              <span>{deck.format}</span>
            </div>
          </div>

          <div className="mana-curve-chart">
            <h3>Mana Curve</h3>
            <div className="curve-bars">
              {Object.entries(deck.manaCurve).map(([cost, curveCount]) => (
                <div key={cost} className="curve-bar-wrapper">
                  <div
                    className="curve-bar"
                    style={{ height: `${Math.min(((curveCount as number) / 20) * 100, 100)}%` }}
                  />
                  <div className="curve-label">{cost}</div>
                  <div className="curve-count">{String(curveCount)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="deck-list">
            <h3>Cards</h3>
            <div className="deck-cards">
              {deck.cards.map((card: any, i: number) => (
                <DeckCardRow key={i} quantity={card.quantity} name={card.cardName} imageUri={card.imageUri} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {importedDeck && (
        <div className="deck-result imported-deck">
          <div className="deck-header">
            <h2>Imported: {importedDeck.playerName}'s deck</h2>
            <button type="button" className="btn btn-secondary" onClick={() => setImportedDeck(null)}>
              Clear
            </button>
          </div>
          <p className="deck-builder-subtitle imported-deck-meta">
            {importedDeck.tournamentName} ·{' '}
            {new Date(importedDeck.tournamentDate).toLocaleDateString()} · {importedDeck.wins}-
            {importedDeck.losses}
            {importedDeck.draws > 0 ? `-${importedDeck.draws}` : ''}
          </p>

          <div className="deck-list">
            <h3>Mainboard</h3>
            <div className="deck-cards">
              {importedDeck.mainboard.map((card: any, i: number) => (
                <DeckCardRow key={i} quantity={card.count} name={card.name} imageUri={card.imageUri} />
              ))}
            </div>
            {importedDeck.sideboard.length > 0 && (
              <>
                <h3>Sideboard</h3>
                <div className="deck-cards">
                  {importedDeck.sideboard.map((card: any, i: number) => (
                    <DeckCardRow key={i} quantity={card.count} name={card.name} imageUri={card.imageUri} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
