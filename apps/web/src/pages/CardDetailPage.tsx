import { useParams, useNavigate } from 'react-router-dom';
import { useCard } from '../hooks/useCards';
import type { LegalityStatus } from '../lib/types';

const FORMAT_LABELS: Record<string, string> = {
  standard: 'Standard',
  pioneer: 'Pioneer',
  modern: 'Modern',
  legacy: 'Legacy',
  vintage: 'Vintage',
  commander: 'Commander',
  pauper: 'Pauper',
  historic: 'Historic',
  alchemy: 'Alchemy',
  brawl: 'Brawl',
};

const LEGALITY_COLORS: Record<LegalityStatus, string> = {
  legal: '#4caf50',
  not_legal: '#757575',
  banned: '#f44336',
  restricted: '#ff9800',
};

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading, error } = useCard(id || '');

  if (isLoading) {
    return (
      <div className="card-detail-loading">
        <div className="skeleton-detail" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="error-page">
        <h2>Card not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="card-detail">
      <button className="btn btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card-detail-layout">
        <div className="card-detail-images">
          <img
            src={card.imageUris?.large || card.imageUris?.normal}
            alt={card.name}
            className="card-detail-image"
          />
          {card.imageUris?.artCrop && (
            <img
              src={card.imageUris.artCrop}
              alt={`${card.name} art`}
              className="card-detail-art"
            />
          )}
        </div>

        <div className="card-detail-info">
          <h1 className="card-detail-name">{card.name}</h1>
          <div className="card-detail-mana">{card.manaCost}</div>
          <div className="card-detail-type">{card.typeLine}</div>

          <div className="card-detail-text">{card.oracleText}</div>

          {card.flavorText && (
            <div className="card-detail-flavor">"{card.flavorText}"</div>
          )}

          {(card.power || card.toughness) && (
            <div className="card-detail-pt">
              {card.power}/{card.toughness}
            </div>
          )}

          {card.loyalty && (
            <div className="card-detail-loyalty">Loyalty: {card.loyalty}</div>
          )}

          <div className="card-detail-meta">
            <div>
              <strong>Set:</strong> {card.setName} ({card.setCode.toUpperCase()})
            </div>
            <div>
              <strong>Rarity:</strong> {card.rarity}
            </div>
            <div>
              <strong>Artist:</strong> {card.artist}
            </div>
            {card.edhrecRank && (
              <div>
                <strong>EDHREC Rank:</strong> #{card.edhrecRank.toLocaleString()}
              </div>
            )}
          </div>

          {card.prices?.usd && (
            <div className="card-detail-prices">
              <h3>Prices</h3>
              <div className="price-grid">
                {card.prices.usd && <div>USD: ${card.prices.usd}</div>}
                {card.prices.usdFoil && <div>USD Foil: ${card.prices.usdFoil}</div>}
                {card.prices.eur && <div>EUR: €{card.prices.eur}</div>}
                {card.prices.tix && <div>Tix: {card.prices.tix}</div>}
              </div>
            </div>
          )}

          <div className="card-detail-legalities">
            <h3>Legality</h3>
            <div className="legality-grid">
              {Object.entries(card.legalities).map(([format, status]) => (
                <div
                  key={format}
                  className="legality-item"
                  style={{ color: LEGALITY_COLORS[status as LegalityStatus] }}
                >
                  <span className="legality-format">{FORMAT_LABELS[format] || format}</span>
                  <span className="legality-status">{String(status)}</span>
                </div>
              ))}
            </div>
          </div>

          {card.keywords.length > 0 && (
            <div className="card-detail-keywords">
              <h3>Keywords</h3>
              <div className="keyword-tags">
                {card.keywords.map((kw: string) => (
                  <span key={kw} className="keyword-tag">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
