'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicImage from '@/components/PublicImage';
import PublicShell from '@/components/PublicShell';
import { publicPhotoFallbacks, publicProjectFallbacks } from '@/data/publicProjects';
import { formatDate } from '@/lib/api';
import type { Photo, Project } from '@/types';

export default function PublicProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [active, setActive] = useState<Photo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fallbackProject = publicProjectFallbacks.find((item) => item.id === id);
    const fallbackPhotos = publicPhotoFallbacks.filter((photo) => photo.projectId === id);

    Promise.allSettled([
      fetch(`/api/v1/public/projects/${id}`).then((response) => response.ok ? response.json() : Promise.reject()),
      fetch(`/api/v1/public/projects/${id}/photos`).then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([projectResult, photosResult]) => {
      const resolvedProject = projectResult.status === 'fulfilled' ? projectResult.value : fallbackProject;
      if (!resolvedProject) {
        setError('প্রকল্পটি পাওয়া যায়নি');
        return;
      }
      setProject(resolvedProject);
      setPhotos(photosResult.status === 'fulfilled' ? photosResult.value : fallbackPhotos);
    });
  }, [id]);

  return <PublicShell><main>
    {error ? <div className="public-wrap public-message public-page-message">{error}</div> : !project ? <div className="public-loading public-page-loading"><span className="spinner"/>প্রকল্পের তথ্য লোড হচ্ছে…</div> : <>
      <section className="public-project-hero"><div className="public-wrap"><Link href="/public/photo-archive" className="public-back">← ফটো আর্কাইভ</Link><span>জাতীয় আবাসন প্রকল্প</span><h1>{project.projectName}</h1><div className="public-project-meta"><b>{project.location}</b><i/><b>প্রকাশিত</b><i/><b>{photos.length.toLocaleString('bn-BD')}টি অনুমোদিত ছবি</b></div>{project.description ? <p>{project.description}</p> : null}</div></section>
      <section className="public-wrap public-gallery-section"><div className="public-section-head"><div><span>বাস্তব চিত্র</span><h2>প্রকল্পের আলোকচিত্র</h2></div><p>ছবিতে ক্লিক করে বড় করে দেখুন</p></div>{photos.length ? <div className="public-gallery-grid">{photos.map((photo, index) => <button className="public-gallery-card" key={photo.id} onClick={() => setActive(photo)}><div><PublicImage photoId={photo.id} alt={photo.title} priority={index < 4}/></div><span>{photo.captureDate ? formatDate(photo.captureDate) : 'তারিখ উল্লেখ নেই'}</span><strong>{photo.title}</strong><small>{photo.location ?? project.location}</small></button>)}</div> : <div className="public-message">এই প্রকল্পে প্রকাশিত ছবি নেই।</div>}</section>
    </>}
    {active ? <div className="public-lightbox" role="dialog" aria-modal="true" aria-label={active.title}><button className="public-lightbox-close" onClick={() => setActive(null)} aria-label="বন্ধ করুন">×</button><div className="public-lightbox-image"><PublicImage photoId={active.id} alt={active.title} full/></div><div className="public-lightbox-copy"><span>বাস্তব চিত্র</span><h2>{active.title}</h2><p>{active.description}</p><small>{active.captureDate ? formatDate(active.captureDate) : 'তারিখ উল্লেখ নেই'} · {active.location ?? project?.location}</small></div></div> : null}
  </main></PublicShell>;
}
