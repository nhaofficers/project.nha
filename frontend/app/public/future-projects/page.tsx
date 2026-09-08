import Link from 'next/link';
import PublicShell from '@/components/PublicShell';
import { futureProjects, futureProjectSummary } from '@/data/futureProjects';

export default function FutureProjectsPage() {
  return <PublicShell><main>
    <section className="public-project-hero future-hero"><div className="public-wrap">
      <Link href="/" className="public-back">← ড্যাশবোর্ডে ফিরুন</Link>
      <span>প্রকল্পের অবস্থা</span><h1>ভবিষ্যৎ প্রকল্পসমূহ</h1>
      <p>নিকটমেয়াদি উদ্যোগ ও দীর্ঘমেয়াদি পরিকল্পনায় থাকা প্রকল্পসমূহের সমন্বিত তালিকা।</p>
    </div></section>
    <section className="public-wrap completed-summary future-summary" aria-label="ভবিষ্যৎ প্রকল্পের সারসংক্ষেপ">
      <div><strong>{futureProjectSummary.projects}</strong><span>মোট প্রকল্প</span></div>
      <div><strong>{futureProjectSummary.nearTerm}</strong><span>নিকটমেয়াদি পরিকল্পনা</span></div>
      <div><strong>{futureProjectSummary.longTerm}</strong><span>দীর্ঘমেয়াদি পরিকল্পনা</span></div>
      <div><strong>{futureProjectSummary.quantified}</strong><span>পরিমাণ উল্লেখিত প্রকল্প</span></div>
    </section>
    <section className="public-wrap completed-list-section">
      <div className="public-section-head"><div><span>সমন্বিত তথ্য</span><h2>ভবিষ্যৎ পরিকল্পনাধীন প্রকল্পের তালিকা</h2></div><p>{futureProjects.length.toLocaleString('bn-BD')}টি প্রকল্প</p></div>
      <div className="completed-table-wrap"><table className="completed-table future-table"><thead><tr><th>ক্রম</th><th>পরিকল্পনার ধাপ</th><th>প্রকল্পের নাম</th><th>স্থান</th><th>প্রকল্পের ধরন</th><th>ইউনিট সংখ্যা</th><th>বাস্তবায়নকাল</th><th>বর্তমান অবস্থা</th></tr></thead><tbody>{futureProjects.map((project) => <tr key={project.serial}><td>{project.serial}</td><td><span className={`future-group ${project.group === 'নিকটমেয়াদি পরিকল্পনা' ? 'near' : 'long'}`}>{project.group}</span></td><td><strong>{project.name}</strong></td><td>{project.location}</td><td>{project.projectType}</td><td>{project.units}</td><td>{project.duration}</td><td>{project.status}</td></tr>)}</tbody></table></div>
      <div className="completed-source"><div><strong>তথ্যসূত্র</strong><p>“এনএইচএ প্রকল্পসমূহের সমন্বিত তালিকা” নথিতে দেওয়া তথ্য পাঠযোগ্য বাংলা বিন্যাসে উপস্থাপন করা হয়েছে। “উল্লেখ নেই” মানে উৎস নথিতে তথ্যটি দেওয়া হয়নি।</p></div></div>
    </section>
  </main></PublicShell>;
}
