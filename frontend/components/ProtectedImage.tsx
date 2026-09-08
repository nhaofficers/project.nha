'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { accessToken } from '@/lib/api';

export default function ProtectedImage({ photoId, alt }: { photoId: string; alt: string }) {
  const [source, setSource] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'}/photos/${photoId}/thumbnail`, { headers: { Authorization: `Bearer ${accessToken() ?? ''}` }, signal: controller.signal })
      .then((response) => response.ok ? response.blob() : Promise.reject(new Error('Image unavailable')))
      .then((blob) => { objectUrl = URL.createObjectURL(blob); setSource(objectUrl); }).catch(() => undefined);
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [photoId]);
  return source ? <Image unoptimized fill sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw" alt={alt} src={source}/> : <span className="preview-placeholder">Protected preview</span>;
}
