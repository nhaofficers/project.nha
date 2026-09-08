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
      <div><strong>{completedProjectSummary.otherProjects}</strong><span>অন্যান্য প্রকল্প</span></div>
      <div><strong>{completedProjectSummary.plots}</strong><span>মোট প্লট</span></div>
      <div><strong>{completedProjectSummary.flats}</strong><span>মোট ফ্ল্যাট</span></div>
    </section>
    <section className="public-wrap completed-list-section">
      <div className="public-section-head"><div><span>অফিসিয়াল তথ্য</span><h2>সমাপ্ত ও হস্তান্তরকৃত প্রকল্পের তালিকা</h2></div><p>সর্বশেষ হালনাগাদ: {completedProjectSummary.updated}</p></div>
      <div className="completed-table-wrap"><table className="completed-table"><thead><tr><th>ক্রম</th><th>ধরন</th><th>প্রকল্পের নাম</th><th>সংখ্যা</th><th>প্রকল্প মূল্য<br/>(লক্ষ টাকা)</th><th>প্রকল্পের মেয়াদ</th></tr></thead><tbody>{completedProjects.map((project) => <tr key={project.id}><td>{project.serial}</td><td><span className="division-pill">{project.category}</span></td><td>{project.name}</td><td><strong>{project.quantity}</strong></td><td>{project.cost}</td><td>{project.duration}</td></tr>)}</tbody></table></div>
      <div className="completed-source"><div><strong>তথ্যসূত্র</strong><p>প্রদত্ত “Projects Completed 25-11” তালিকা অনুযায়ী তথ্য উপস্থাপন করা হয়েছে। বানান, তারিখ ও সংখ্যার বিন্যাস পাঠযোগ্যতার জন্য স্বাভাবিক করা হয়েছে; উৎসে অনুল্লেখিত ঘরগুলো “উল্লেখ নেই” হিসেবে রাখা হয়েছে।</p></div></div>
    </section>
  </main></PublicShell>;
}
