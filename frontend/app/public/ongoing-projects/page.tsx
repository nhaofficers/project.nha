import Link from 'next/link';
import PublicShell from '@/components/PublicShell';
import { ongoingProjects, ongoingProjectSummary } from '@/data/ongoingProjects';

export default function OngoingProjectsPage() {
  return <PublicShell><main>
    <section className="public-project-hero ongoing-hero"><div className="public-wrap">
      <Link href="/" className="public-back">← ড্যাশবোর্ডে ফিরুন</Link>
      <span>প্রকল্পের অবস্থা</span><h1>চলমান প্রকল্পসমূহ</h1>
      <p>জাতীয় গৃহায়ন কর্তৃপক্ষের প্রকাশিত চলমান প্রকল্পের যাচাইকৃত তালিকা।</p>
    </div></section>
    <section className="public-wrap completed-summary ongoing-summary" aria-label="চলমান প্রকল্পের সারসংক্ষেপ">
      <div><strong>{ongoingProjectSummary.projects}</strong><span>মোট প্রকল্প</span></div>
      <div><strong>{ongoingProjectSummary.flatProjects}</strong><span>ফ্ল্যাট প্রকল্প</span></div>
      <div><strong>{ongoingProjectSummary.plotProjects}</strong><span>প্লট প্রকল্প</span></div>
      <div><strong>{ongoingProjectSummary.otherProjects}</strong><span>অন্যান্য প্রকল্প</span></div>
    </section>
    <section className="public-wrap completed-list-section">
      <div className="public-section-head"><div><span>প্রদত্ত নথির তথ্য</span><h2>চলমান প্রকল্পের পূর্ণ তালিকা</h2></div><p>{ongoingProjects.length.toLocaleString('bn-BD')}টি প্রকল্প · হালনাগাদ: {ongoingProjectSummary.updated}</p></div>
      <div className="completed-table-wrap"><table className="completed-table ongoing-table"><thead><tr><th>ক্রম</th><th>ধরন</th><th>প্রকল্পের নাম</th><th>মেয়াদ</th><th>বিস্তারিত</th></tr></thead><tbody>{ongoingProjects.map((project) => <tr key={project.id}><td>{project.serial}</td><td><span className={`ongoing-kind kind-${project.kind}`}>{project.category}</span></td><td>{project.name}</td><td>{project.duration}</td><td><Link className="official-detail-link" href={`/public/ongoing-projects/${project.id}`}>বিস্তারিত দেখুন →</Link></td></tr>)}</tbody></table></div>
      <div className="completed-source"><div><strong>তথ্যসূত্র</strong><p>প্রদত্ত “Projects Running Details Portrait 25-11” নথির প্রকল্পভিত্তিক তথ্য হুবহু পৃথক রেখে উপস্থাপন করা হয়েছে। একই প্রকল্পের মূল ও সংশোধিত ব্যয় একত্রে সংশ্লিষ্ট বিস্তারিত পাতায় দেখানো হয়েছে।</p></div></div>
    </section>
  </main></PublicShell>;
}
