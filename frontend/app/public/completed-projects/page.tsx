import Link from 'next/link';
import PublicShell from '@/components/PublicShell';
import { completedProjects, completedProjectSummary } from '@/data/completedProjects';

export default function CompletedProjectsPage() {
  return <PublicShell><main>
    <section className="public-project-hero completed-hero"><div className="public-wrap">
      <Link href="/" className="public-back">← ড্যাশবোর্ডে ফিরুন</Link>
      <span>প্রকল্পের অবস্থা</span><h1>সমাপ্ত প্রকল্পসমূহ</h1>
      <p>জাতীয় গৃহায়ন কর্তৃপক্ষ কর্তৃক সমাপ্ত ও হস্তান্তরকৃত প্রকল্পের অফিসিয়াল তালিকা।</p>
    </div></section>
    <section className="public-wrap completed-summary" aria-label="সমাপ্ত প্রকল্পের সারসংক্ষেপ">
      <div><strong>{completedProjectSummary.projects}</strong><span>মোট প্রকল্প</span></div>
      <div><strong>{completedProjectSummary.plotProjects}</strong><span>প্লট প্রকল্প</span></div>
      <div><strong>{completedProjectSummary.flatProjects}</strong><span>ফ্ল্যাট প্রকল্প</span></div>
      <div><strong>{completedProjectSummary.plots}</strong><span>মোট প্লট</span></div>
      <div><strong>{completedProjectSummary.flats}</strong><span>মোট ফ্ল্যাট</span></div>
    </section>
    <section className="public-wrap completed-list-section">
      <div className="public-section-head"><div><span>অফিসিয়াল তথ্য</span><h2>সমাপ্ত ও হস্তান্তরকৃত প্রকল্পের তালিকা</h2></div><p>সর্বশেষ হালনাগাদ: {completedProjectSummary.updated}</p></div>
      <div className="completed-table-wrap"><table className="completed-table"><thead><tr><th>ক্রম</th><th>ডিভিশন</th><th>প্রকল্পের নাম</th><th>ফ্ল্যাট</th><th>প্লট</th><th>সমাপ্তির সন</th></tr></thead><tbody>{completedProjects.map((project) => <tr key={project.serial}><td>{project.serial}</td><td><span className="division-pill">{project.division}</span></td><td>{project.name}</td><td>{project.flats}</td><td>{project.plots}</td><td><strong>{project.year}</strong></td></tr>)}</tbody></table></div>
      <div className="completed-source"><div><strong>তথ্যসূত্র</strong><p>জাতীয় গৃহায়ন কর্তৃপক্ষের প্রকাশিত তালিকা অনুযায়ী তথ্য উপস্থাপন করা হয়েছে। বানান ও সংখ্যার বিন্যাস পাঠযোগ্যতার জন্য স্বাভাবিক করা হয়েছে।</p></div><a href="https://nha.gov.bd/pages/static-pages/6922dbbc933eb65569e0c2e7" target="_blank" rel="noreferrer">অফিসিয়াল তালিকা দেখুন ↗</a></div>
    </section>
  </main></PublicShell>;
}
