import type { MtgCard } from '../lib/types';

interface CardGridProps {
  cards: MtgCard[];
  onCardClick?: (id: string) => void;
}

export default function CardGrid({ cards, onCardClick }: CardGridProps) {
  if (cards.length === 0) {
    return <div className="empty-state">No cards found</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className="card-item"
          onClick={() => onCardClick?.(card.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCardClick?.(card.id)}
        >
          <div className="card-image-wrapper">
            {card.imageUris?.normal ? (
              <img
                src={card.imageUris.normal}
                alt={card.name}
                className="card-image"
                loading="lazy"
              />
            ) : (
              <div className="card-image-placeholder">{card.name}</div>
            )}
          </div>
          <div className="card-info">
            <div className="card-name">{card.name}</div>
            <div className="card-type">{card.typeLine}</div>
            {card.prices?.usd && (
              <div className="card-price">${card.prices.usd}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
