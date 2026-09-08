import ProjectTypePage from '@/components/ProjectTypePage';
import { plotProjects, projectTypeSummaries } from '@/data/projectTypeProjects';

export default function PlotProjectsPage() {
  const summary = projectTypeSummaries.plot;
  return <ProjectTypePage kind="plot" title="প্লটভিত্তিক প্রকল্পসমূহ" subtitle="সমাপ্ত ও চলমান সরকারি প্রকল্পের মধ্যে যেসব প্রকল্পে আবাসিক বা বাণিজ্যিক প্লট স্পষ্টভাবে উল্লেখ আছে।" projects={plotProjects} {...summary}/>;
}
