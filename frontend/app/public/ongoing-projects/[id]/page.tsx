import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicShell from '@/components/PublicShell';
import { getOngoingProject, ongoingProjects } from '@/data/ongoingProjects';

export function generateStaticParams(){ return ongoingProjects.map((project)=>({ id:project.id })); }

export default async function OngoingProjectDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const project=getOngoingProject(id);
  if(!project) notFound();
  return <PublicShell><main>
    <section className="public-project-hero ongoing-hero ongoing-detail-hero"><div className="public-wrap">
      <Link href="/public/ongoing-projects" className="public-back">← চলমান প্রকল্পের তালিকায় ফিরুন</Link>
      <span>{project.category} · ক্রম {project.serial}</span><h1>{project.name}</h1>
      <div className="public-project-meta"><span>চলমান</span><i/><span>{project.duration}</span></div>
    </div></section>
    <section className="public-wrap ongoing-detail-section">
      <div className="ongoing-detail-grid">
        <article className="ongoing-detail-card"><span>প্রকল্প মূল্য</span><h2>মূল ও সংশোধিত ব্যয়</h2><ul>{project.costs.map((cost)=><li key={cost}>{cost} লক্ষ টাকা</li>)}</ul></article>
        <article className="ongoing-detail-card"><span>অনুমোদিত মেয়াদ</span><h2>বাস্তবায়নকাল</h2><p>{project.duration}</p></article>
        <article className="ongoing-detail-card"><span>জমির পরিমাণ</span><h2>{project.landArea}</h2></article>
        {project.buildings?.length ? <article className="ongoing-detail-card"><span>ভবন সংখ্যা ও বিবরণ</span><h2>ভবন</h2><ul>{project.buildings.map((item)=><li key={item}>{item}</li>)}</ul></article> : null}
        <article className="ongoing-detail-card ongoing-detail-wide"><span>{project.kind==='plot'?'প্লট সংখ্যা ও ধরন':'ইউনিট সংখ্যা ও আয়তন'}</span><h2>{project.kind==='plot'?'প্লটের বিবরণ':'ফ্ল্যাট বা স্পেসের বিবরণ'}</h2><ul>{project.units.map((item)=><li key={item}>{item}</li>)}</ul></article>
        <article className="ongoing-detail-card ongoing-detail-wide"><span>{project.kind==='plot'?'প্লটের মূল্য':'ফ্ল্যাট বা স্পেসের মূল্য'}</span><h2>অনুমোদিত মূল্য</h2><ul>{project.prices.map((item)=><li key={item}>{item}</li>)}</ul></article>
        {project.parking ? <article className="ongoing-detail-card"><span>পার্কিং সংখ্যা</span><h2>{project.parking}</h2></article> : null}
      </div>
      <div className="ongoing-detail-source"><strong>তথ্যসূত্র</strong><p>“Projects Running Details Portrait 25-11” নথিতে এই প্রকল্পের জন্য প্রদত্ত তথ্য।</p></div>
    </section>
  </main></PublicShell>;
}
