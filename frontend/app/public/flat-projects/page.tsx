import ProjectTypePage from '@/components/ProjectTypePage';
import { flatProjects, projectTypeSummaries } from '@/data/projectTypeProjects';

export default function FlatProjectsPage() {
  const summary = projectTypeSummaries.flat;
  return <ProjectTypePage kind="flat" title="ফ্ল্যাটভিত্তিক প্রকল্পসমূহ" subtitle="সমাপ্ত ও চলমান সরকারি প্রকল্পের মধ্যে যেসব প্রকল্পে আবাসিক ফ্ল্যাট স্পষ্টভাবে উল্লেখ আছে।" projects={flatProjects} {...summary}/>;
}
