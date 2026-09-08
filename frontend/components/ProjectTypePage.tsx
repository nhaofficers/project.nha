import Link from 'next/link';
import PublicShell from '@/components/PublicShell';
import type { ProjectTypeEntry } from '@/data/projectTypeProjects';

type ProjectTypePageProps = {
  kind: 'plot' | 'flat';
  title: string;
  subtitle: string;
  total: string;
  completed: string;
  ongoing: string;
  future: string;
  units: string;
  unitLabel: string;
  projects: ProjectTypeEntry[];
};

export default function ProjectTypePage({ kind, title, subtitle, total, completed, ongoing, future, units, unitLabel, projects }: ProjectTypePageProps) {
  return <PublicShell><main>
    <section className={`public-project-hero type-hero type-hero-${kind}`}><div className="public-wrap">
      <Link href="/" className="public-back">← ড্যাশবোর্ডে ফিরুন</Link>
      <span>প্রকল্পের ধরন</span><h1>{title}</h1><p>{subtitle}</p>
    </div></section>
    <section className="public-wrap type-summary" aria-label={`${title} সারসংক্ষেপ`}>
      <div><strong>{total}</strong><span>মোট প্রকল্প</span></div>
      <div><strong>{completed}</strong><span>সমাপ্ত প্রকল্প</span></div>
      <div><strong>{ongoing}</strong><span>চলমান প্রকল্প</span></div>
      <div><strong>{future}</strong><span>ভবিষ্যৎ প্রকল্প</span></div>
      <div><strong>{units}</strong><span>{unitLabel}</span></div>
    </section>
    <section className="public-wrap type-project-list">
      <div className="public-section-head"><div><span>প্রকল্পভিত্তিক তথ্য</span><h2>{title} তালিকা</h2></div><p>{projects.length.toLocaleString('bn-BD')}টি প্রকল্প</p></div>
      <div className="type-list-grid">{projects.map((project, index) => <article className="type-list-card" key={project.id}>
        <div className="type-list-number">{(index + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</div>
        <div><span className={`type-status status-${project.status === 'সমাপ্ত' ? 'completed' : project.status === 'চলমান' ? 'ongoing' : 'future'}`}>{project.status}</span><h3>{project.name}</h3><p>{project.detail}</p></div>
        {project.sourceUrl ? <a href={project.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${project.name}—অফিসিয়াল উৎস দেখুন`}>অফিসিয়াল উৎস ↗</a> : <span className="type-document-source">সমন্বিত তালিকা</span>}
      </article>)}</div>
      <div className="type-source-note">একই প্রকল্পের নামে প্লট ও ফ্ল্যাট—উভয়টি স্পষ্টভাবে থাকলে সেটি উভয় তালিকায় দেখা যেতে পারে। কেবল সরকারি তালিকায় স্পষ্টভাবে উল্লেখিত ধরন অন্তর্ভুক্ত হয়েছে।</div>
    </section>
  </main></PublicShell>;
}
