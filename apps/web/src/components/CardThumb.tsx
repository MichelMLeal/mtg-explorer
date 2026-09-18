import { useState } from 'react';

interface CardThumbProps {
  src: string;
  alt: string;
}

export default function CardThumb({ src, alt }: CardThumbProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`deck-card-thumb ${loaded ? 'thumb-loaded' : ''}`}
    />
  );
}
