'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PublicImage from '@/components/PublicImage';
import type { PublicProject } from '@/types';

type ProjectPhotoSliderProps = {
  projects: PublicProject[];
};

export default function ProjectPhotoSlider({ projects }: ProjectPhotoSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || projects.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % projects.length), 5500);
    return () => window.clearInterval(timer);
  }, [playing, projects.length]);

  if (!projects.length) return null;

  const activeProject = projects[activeIndex % projects.length]!;
  const move = (direction: number) => setActiveIndex((current) => (current + direction + projects.length) % projects.length);

  return <div className="project-slider" aria-roledescription="ক্যারোসেল" aria-label="অনুমোদিত প্রকল্পের ছবি">
    <div className="project-slide" aria-live="polite">
      <PublicImage photoId={activeProject.coverPhotoId} alt={activeProject.projectName} full priority/>
      <div className="project-slide-shade"/>
      <div className="project-slide-copy"><span>{activeProject.location}</span><h2>{activeProject.projectName}</h2><div><strong>{activeProject._count.photos.toLocaleString('bn-BD')}টি অনুমোদিত ছবি</strong><Link href={`/public/projects/${activeProject.id}`}>প্রকল্পটি দেখুন →</Link></div></div>
      <div className="project-slide-count"><strong>{(activeIndex + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</strong><span>/</span><small>{projects.length.toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</small></div>
    </div>
    <div className="slider-controls">
      <div><button type="button" onClick={() => move(-1)} aria-label="আগের ছবি">←</button><button type="button" onClick={() => move(1)} aria-label="পরের ছবি">→</button></div>
      <div className="slider-dots" aria-label="ছবি নির্বাচন">{projects.map((project, index) => <button type="button" className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} aria-label={`${index + 1} নম্বর ছবি: ${project.projectName}`} aria-current={index === activeIndex ? 'true' : undefined} key={project.id}/>)}</div>
      <button type="button" className="slider-play" onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'স্বয়ংক্রিয় স্লাইড বন্ধ করুন' : 'স্বয়ংক্রিয় স্লাইড চালু করুন'}>{playing ? 'বিরতি' : 'চালু করুন'}</button>
    </div>
  </div>;
}
