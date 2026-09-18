import { useState } from 'react';

interface CardThumbProps {
  src: string;
  alt: string;
}

export default function CardThumb({ src, alt }: CardThumbProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="card-thumb-wrapper">
      {!loaded && <span className="card-thumb-spinner" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`deck-card-thumb ${loaded ? 'thumb-loaded' : ''}`}
      />
    </span>
  );
}
