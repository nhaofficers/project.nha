'use client';

import Image from 'next/image';
import { useState } from 'react';

type PublicImageProps = {
  photoId: string;
  alt: string;
  full?: boolean;
  priority?: boolean;
};

export default function PublicImage({ photoId, alt, full = false, priority = false }: PublicImageProps) {
  const [source, setSource] = useState<'api' | 'static' | 'failed'>('api');
  const variant = full ? 'image' : 'thumbnail';
  const src = source === 'api' ? `/api/v1/public/photos/${photoId}/${variant}` : `/project-images/${photoId}.webp`;

  if (source === 'failed') return <div className="public-image-fallback">ছবি পাওয়া যায়নি</div>;

  return <Image
    fill
    unoptimized
    priority={priority}
    sizes={full ? '(max-width: 900px) 100vw, 900px' : '(max-width: 720px) 100vw, 33vw'}
    src={src}
    alt={alt}
    onError={() => setSource((current) => current === 'api' ? 'static' : 'failed')}
  />;
}
