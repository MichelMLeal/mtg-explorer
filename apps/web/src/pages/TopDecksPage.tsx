import { useState } from 'react';
import type { MtgFormat } from '../lib/types';
import { useTopDecks } from '../hooks/useCards';
import CardThumb from '../components/CardThumb';

// Only formats TopDeck.gg actually has paper-tournament data for.
const FORMATS: MtgFormat[] = ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper'];

function formatRecord(wins: number, losses: number, draws: number): string {
  return draws > 0 ? `${wins}-${losses}-${draws}` : `${wins}-${losses}`;
}

function DeckCardRow({ card }: { card: { name: string; count: number; imageUri?: string } }) {
  return (
    <div className="deck-card-item">
      {card.imageUri && <CardThumb src={card.imageUri} alt={card.name} />}
      <span className="deck-card-qty">{card.count}x</span>
      <span className="deck-card-name">{card.name}</span>
      {card.imageUri && (
        <div className="card-hover-preview">
          <img src={card.imageUri} alt={card.name} />
        </div>
      )}
    </div>
  );
}

export default function TopDecksPage() {
  const [format, setFormat] = useState<MtgFormat>('commander');
  const { data, isLoading, error } = useTopDecks(format);
  const decks = data?.data || [];

  return (
    <div className="top-decks-page">
      <h1>Top Decks</h1>
      <p className="deck-builder-subtitle">
        Recent tournament results, best record first. Data provided by{' '}
        <a href="https://topdeck.gg" target="_blank" rel="noreferrer">
          TopDeck.gg
        </a>
        .
      </p>

      <div className="config-section top-decks-format">
        <select
          className="select-input"
          value={format}
          onChange={(e) => setFormat(e.target.value as MtgFormat)}
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error instanceof Error && error.message.includes('not configured')
            ? 'Top Decks is not configured on this server (missing TOPDECK_API_KEY).'
            : `Error: ${error instanceof Error ? error.message : 'Failed to load top decks'}`}
        </div>
      )}

      {isLoading && <div className="loading">Loading top decks...</div>}

      {!isLoading && !error && decks.length === 0 && (
        <div className="empty-state">No recent tournament results found for this format.</div>
      )}

      <div className="top-decks-list">
        {decks.map((deck: any, i: number) => (
          <details key={i} className="top-deck-item">
            <summary className="top-deck-summary">
              <span className="top-deck-rank">#{i + 1}</span>
              <span className="top-deck-player">{deck.playerName}</span>
              <span className="top-deck-record">{formatRecord(deck.wins, deck.losses, deck.draws)}</span>
              <span className="top-deck-tournament">
                {deck.tournamentName} · {new Date(deck.tournamentDate).toLocaleDateString()}
              </span>
            </summary>
            <div className="deck-list">
              <h3>Mainboard</h3>
              <div className="deck-cards">
                {deck.mainboard.map((card: any) => (
                  <DeckCardRow key={card.name} card={card} />
                ))}
              </div>
              {deck.sideboard.length > 0 && (
                <>
                  <h3>Sideboard</h3>
                  <div className="deck-cards">
                    {deck.sideboard.map((card: any) => (
                      <DeckCardRow key={card.name} card={card} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
