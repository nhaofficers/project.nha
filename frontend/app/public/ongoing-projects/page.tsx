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
      <div><strong>{ongoingProjectSummary.status}</strong><span>প্রকল্পের অবস্থা</span></div>
      <div><strong>অফিসিয়াল</strong><span>তথ্যের উৎস</span></div>
    </section>
    <section className="public-wrap completed-list-section">
      <div className="public-section-head"><div><span>অফিসিয়াল তথ্য</span><h2>চলমান প্রকল্পের পূর্ণ তালিকা</h2></div><p>{ongoingProjects.length.toLocaleString('bn-BD')}টি প্রকল্প</p></div>
      <div className="completed-table-wrap"><table className="completed-table ongoing-table"><thead><tr><th>ক্রম</th><th>প্রকল্পের নাম</th><th>অফিসিয়াল বিস্তারিত</th></tr></thead><tbody>{ongoingProjects.map((project) => <tr key={project.serial}><td>{project.serial}</td><td>{project.name}</td><td><a className="official-detail-link" href={project.sourceUrl} target="_blank" rel="noreferrer">বিস্তারিত দেখুন ↗</a></td></tr>)}</tbody></table></div>
      <div className="completed-source"><div><strong>তথ্যসূত্র ও স্বচ্ছতা</strong><p>জাতীয় গৃহায়ন কর্তৃপক্ষের প্রকাশিত তালিকা অনুযায়ী প্রকল্পের নাম উপস্থাপন করা হয়েছে। উৎস তালিকায় প্রকল্পের ধরন ও সময়কাল পূর্ণাঙ্গ না থাকায় অনুমানভিত্তিক তথ্য দেখানো হয়নি।</p></div><a href="https://nha.gov.bd/pages/projects" target="_blank" rel="noreferrer">অফিসিয়াল তালিকা দেখুন ↗</a></div>
    </section>
  </main></PublicShell>;
}
