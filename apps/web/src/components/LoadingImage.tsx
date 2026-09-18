import { useState } from 'react';

interface LoadingImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}

export default function LoadingImage({ src, alt, className, wrapperClassName }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`loading-image-wrapper ${wrapperClassName || ''}`}>
      {!loaded && <span className="loading-image-spinner" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className || ''} ${loaded ? 'image-loaded' : 'image-loading'}`}
      />
    </span>
  );
}
