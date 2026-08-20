import { useState } from 'react';
import type { MtgColor, MtgFormat, DeckStyle } from '../lib/types';
import ManaFilter from '../components/ManaFilter';
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
  const [colors, setColors] = useState<MtgColor[]>([]);
  const [format, setFormat] = useState<MtgFormat>('standard');
  const [style, setStyle] = useState<DeckStyle>('fun');
  const [budget, setBudget] = useState<number | undefined>(undefined);

  const { data, isLoading, error, refetch } = useBuildDeck({
    colors,
    format,
    style,
    budget,
  });

  const deck = data?.data;

  const handleBuild = () => {
    if (colors.length > 0) {
      refetch();
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

        <button
          className="btn btn-primary btn-build"
          onClick={handleBuild}
          disabled={colors.length === 0 || isLoading}
        >
          {isLoading ? 'Building...' : '⚡ Build Deck'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error instanceof Error ? error.message : 'Failed to build deck'}
        </div>
      )}

      {deck && (
        <div className="deck-result">
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
              {Object.entries(deck.manaCurve).map(([cost, count]) => (
                <div key={cost} className="curve-bar-wrapper">
                  <div
                    className="curve-bar"
                    style={{ height: `${Math.min(((count as number) / 20) * 100, 100)}%` }}
                  />
                  <div className="curve-label">{cost}</div>
                  <div className="curve-count">{String(count)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="deck-list">
            <h3>Cards</h3>
            <div className="deck-cards">
              {deck.cards.map((card: any, i: number) => (
                <div key={i} className="deck-card-item">
                  <span className="deck-card-qty">{card.quantity}x</span>
                  <span className="deck-card-name">{card.cardName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
