'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PublicImage from '@/components/PublicImage';
import PublicShell from '@/components/PublicShell';
import { publicProjectFallbacks } from '@/data/publicProjects';
import type { PublicProject } from '@/types';

const typeOptions = [
  { value: 'all', label: 'সব ধরন' },
  { value: 'flat', label: 'ফ্ল্যাট প্রকল্প' },
  { value: 'plot', label: 'প্লট প্রকল্প' },
] as const;

export default function PhotoArchivePage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');
  const [projectType, setProjectType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/public/projects')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('ফটো আর্কাইভের তথ্য পাওয়া যায়নি')))
      .then(setProjects)
      .catch(() => setProjects(publicProjectFallbacks))
      .finally(() => setLoading(false));
  }, []);

  const locations = useMemo(() => [...new Set(projects.map((project) => project.location))].sort((a, b) => a.localeCompare(b, 'bn')), [projects]);
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('bn-BD');
    return projects.filter((project) => {
      const matchesSearch = !query || `${project.projectName} ${project.location}`.toLocaleLowerCase('bn-BD').includes(query);
      const matchesLocation = location === 'all' || project.location === location;
      const matchesType = projectType === 'all' || (projectType === 'plot' ? project.projectName.includes('প্লট') : project.projectName.includes('ফ্ল্যাট'));
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [location, projectType, projects, search]);

  const resetFilters = () => { setSearch(''); setLocation('all'); setProjectType('all'); };

  return <PublicShell><main>
    <section className="public-project-hero archive-hero"><div className="public-wrap"><Link href="/" className="public-back">← ড্যাশবোর্ডে ফিরুন</Link><span>অনুমোদিত আলোকচিত্র</span><h1>প্রকল্পভিত্তিক ফটো আর্কাইভ</h1><p>প্রকল্পের নাম বা স্থান লিখে খুঁজুন এবং ধরন ও অবস্থান অনুযায়ী ফলাফল সীমিত করুন।</p></div></section>
    <section className="public-wrap archive-content">
      <div className="archive-filter-panel" aria-label="ফটো আর্কাইভ অনুসন্ধান ও ফিল্টার">
        <label className="archive-search"><span>প্রকল্প খুঁজুন</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="প্রকল্পের নাম বা স্থান লিখুন…"/></label>
        <label><span>প্রকল্পের ধরন</span><select value={projectType} onChange={(event) => setProjectType(event.target.value)}>{typeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
        <label><span>অবস্থান</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="all">সব অবস্থান</option>{locations.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={resetFilters}>ফিল্টার মুছুন</button>
      </div>
      <div className="archive-result-head"><div><span>অনুসন্ধানের ফলাফল</span><h2>{filteredProjects.length.toLocaleString('bn-BD')}টি প্রকল্প</h2></div><p>মোট {projects.reduce((total, project) => total + project._count.photos, 0).toLocaleString('bn-BD')}টি অনুমোদিত ছবি</p></div>
      {error ? <div className="public-message">{error}</div> : null}
      {loading ? <div className="public-loading"><span className="spinner"/>ফটো আর্কাইভ লোড হচ্ছে…</div> : filteredProjects.length ? <div className="public-project-grid">{filteredProjects.map((project, index) => <Link className="public-project-card" href={`/public/projects/${project.id}`} key={project.id}><div className="public-card-image"><PublicImage photoId={project.coverPhotoId} alt={project.projectName} priority={index < 3}/><span>{(index + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</span></div><div className="public-card-body"><small>{project.location}</small><h3>{project.projectName}</h3><div><span>প্রকাশিত</span><b>{project._count.photos.toLocaleString('bn-BD')}টি ছবি →</b></div></div></Link>)}</div> : !error ? <div className="archive-empty"><strong>কোনো প্রকল্প পাওয়া যায়নি</strong><p>অন্য শব্দ দিয়ে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।</p><button type="button" onClick={resetFilters}>সব প্রকল্প দেখুন</button></div> : null}
    </section>
  </main></PublicShell>;
}
