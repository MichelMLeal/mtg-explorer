import CardThumb from './CardThumb';

interface DeckCardRowProps {
  quantity: number;
  name: string;
  imageUri?: string;
}

export default function DeckCardRow({ quantity, name, imageUri }: DeckCardRowProps) {
  return (
    <div className="deck-card-item">
      {imageUri && <CardThumb src={imageUri} alt={name} />}
      <span className="deck-card-qty">{quantity}x</span>
      <span className="deck-card-name">{name}</span>
      {imageUri && (
        <div className="card-hover-preview">
          <img src={imageUri} alt={name} />
        </div>
      )}
    </div>
  );
}
