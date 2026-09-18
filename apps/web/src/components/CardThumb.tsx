import LoadingImage from './LoadingImage';

interface CardThumbProps {
  src: string;
  alt: string;
}

export default function CardThumb({ src, alt }: CardThumbProps) {
  return (
    <LoadingImage src={src} alt={alt} className="deck-card-thumb" wrapperClassName="card-thumb-wrapper" />
  );
}
