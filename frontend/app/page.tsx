'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProjectPhotoSlider from '@/components/ProjectPhotoSlider';
import PublicShell from '@/components/PublicShell';
import { publicProjectFallbacks } from '@/data/publicProjects';
import type { PublicProject } from '@/types';

const categories = [
  { title: 'সমাপ্ত প্রকল্প', count: '৫৯', detail: 'সমাপ্ত ও হস্তান্তরকৃত প্রকল্পের পূর্ণ তালিকা', href: '/public/completed-projects', tone: 'completed', share: '৬৩%' },
  { title: 'চলমান প্রকল্প', count: '১৬', detail: 'বর্তমানে বাস্তবায়নাধীন প্রকল্পের যাচাইকৃত তালিকা', href: '/public/ongoing-projects', tone: 'ongoing', share: '১৭%' },
  { title: 'ভবিষ্যৎ প্রকল্প', count: '১৮', detail: 'নিকটমেয়াদি ও দীর্ঘমেয়াদি পরিকল্পনার পূর্ণ তালিকা', href: '/public/future-projects', tone: 'future', share: '২০%' },
] as const;

const projectTypes = [
  { title: 'প্লটভিত্তিক প্রকল্প', count: '৩৯', completed: '৩৩', ongoing: '৪', future: '২', units: '৬,০২৪', unitLabel: 'সমাপ্ত প্রকল্পে প্লট', href: '/public/plot-projects', tone: 'plot' },
  { title: 'ফ্ল্যাটভিত্তিক প্রকল্প', count: '৪১', completed: '২৩', ongoing: '১০', future: '৮', units: '৬,৯১৮', unitLabel: 'সমাপ্ত প্রকল্পে ফ্ল্যাট', href: '/public/flat-projects', tone: 'flat' },
] as const;

export default function PublicHome() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/public/projects')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('প্রকল্পের তথ্য পাওয়া যায়নি')))
      .then(setProjects)
      .catch(() => setProjects(publicProjectFallbacks))
      .finally(() => setLoading(false));
  }, []);

  const approvedPhotos = projects.reduce((total, project) => total + project._count.photos, 0);

  return <PublicShell><main className="dashboard-landing">
    <section className="infographic-dashboard" id="project-dashboard"><div className="public-wrap">
      <div className="dashboard-heading"><div><span>প্রকল্পসমূহের সামগ্রিক তথ্য</span><h1>প্রকল্প ড্যাশবোর্ড</h1><p>প্রকল্পের অবস্থা নির্বাচন করে বিস্তারিত তথ্য ও অনুমোদিত আলোকচিত্র দেখুন।</p></div><div className="dashboard-total" aria-label="মোট ৯৩টি তালিকাভুক্ত প্রকল্প"><strong>৯৩</strong><span>সমন্বিত তালিকাভুক্ত<br/>প্রকল্প</span></div></div>
      <div className="status-flow" aria-label="প্রকল্পের অবস্থার প্রবাহ"><span>ভবিষ্যৎ পরিকল্পনা</span><i aria-hidden="true"/><span>বাস্তবায়নাধীন</span><i aria-hidden="true"/><span>সমাপ্ত ও হস্তান্তর</span></div>
      <div className="category-grid infographic-grid">{categories.map((category, index) => <Link className={`category-card category-${category.tone}`} href={category.href} key={category.title}><div className="category-top"><span>{(index + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</span><small>{category.share}</small></div><div className="category-visual" aria-hidden="true"><div className="category-ring"><strong>{category.count}</strong></div><i/><i/><i/></div><h2>{category.title}</h2><p>{category.detail}</p><b>বিস্তারিত দেখুন <span>→</span></b></Link>)}</div>
      <section className="type-infographic" aria-labelledby="type-summary-title"><div className="type-infographic-heading"><div><span>প্রকল্পের ধরন</span><h2 id="type-summary-title">প্লট ও ফ্ল্যাট সামারি</h2></div><p>অবস্থা ও ইউনিটসংখ্যার সমন্বিত চিত্র</p></div><div className="type-infographic-grid">{projectTypes.map((type) => <Link className={`type-infographic-card type-${type.tone}`} href={type.href} key={type.title}><div className="type-icon" aria-hidden="true"><i/><i/><i/><i/></div><div className="type-main"><span>{type.title}</span><strong>{type.count}</strong><small>মোট প্রকল্প</small></div><div className="type-breakdown"><div><strong>{type.completed}</strong><span>সমাপ্ত</span></div><div><strong>{type.ongoing}</strong><span>চলমান</span></div><div><strong>{type.future}</strong><span>ভবিষ্যৎ</span></div><div><strong>{type.units}</strong><span>{type.unitLabel}</span></div></div><b>প্রকল্পভিত্তিক তথ্য দেখুন <span>→</span></b></Link>)}</div></section>
      <div className="dashboard-footnote"><span>তথ্য হালনাগাদ</span><p>সমাপ্ত ও চলমান প্রকল্প ২৫ নভেম্বরের প্রদত্ত তালিকা এবং ভবিষ্যৎ প্রকল্প প্রদত্ত সমন্বিত নথির ভিত্তিতে উপস্থাপিত।</p></div>
    </div></section>

    <section className="featured-photo-section" id="featured-photos"><div className="public-wrap"><div className="public-section-head"><div><span>বাস্তব চিত্র</span><h2>প্রকল্পের নির্বাচিত ছবিসমূহ</h2></div><div className="photo-summary"><strong>{projects.length.toLocaleString('bn-BD')}</strong><span>টি প্রকল্প</span><strong>{approvedPhotos.toLocaleString('bn-BD')}</strong><span>টি ছবি</span><Link href="/public/photo-archive">আর্কাইভে খুঁজুন →</Link></div></div>{error ? <div className="public-message">{error}</div> : null}{loading ? <div className="public-loading"><span className="spinner"/>ছবি লোড হচ্ছে…</div> : projects.length ? <ProjectPhotoSlider projects={projects}/> : !error ? <div className="public-message">এখনও কোনো অনুমোদিত প্রকল্পের ছবি প্রকাশিত হয়নি।</div> : null}</div></section>
  </main></PublicShell>;
}
