import { completedProjects } from '@/data/completedProjects';
import { futureProjects } from '@/data/futureProjects';
import { ongoingProjects } from '@/data/ongoingProjects';

export type ProjectTypeEntry = {
  id: string;
  name: string;
  status: 'সমাপ্ত' | 'চলমান' | 'ভবিষ্যৎ';
  detail: string;
  sourceUrl?: string;
};

const completedPlotProjects: ProjectTypeEntry[] = completedProjects
  .filter((project) => project.kind === 'plot')
  .map((project) => ({
    id: project.id,
    name: project.name,
    status: 'সমাপ্ত',
    detail: `${project.quantity} · ${project.duration}`,
  }));

const completedFlatProjects: ProjectTypeEntry[] = completedProjects
  .filter((project) => project.kind === 'flat')
  .map((project) => ({
    id: project.id,
    name: project.name,
    status: 'সমাপ্ত',
    detail: `${project.quantity} · ${project.duration}`,
  }));

const toOngoingEntry = (project: (typeof ongoingProjects)[number], type: 'প্লট' | 'ফ্ল্যাট'): ProjectTypeEntry => ({
  id: `ongoing-${project.serial}-${type}`,
  name: project.name,
  status: 'চলমান',
  detail: `${type}ভিত্তিক চলমান প্রকল্প`,
  sourceUrl: project.sourceUrl,
});

const toFutureEntry = (project: (typeof futureProjects)[number], type: 'প্লট' | 'ফ্ল্যাট'): ProjectTypeEntry => ({
  id: `future-${project.serial}-${type}`,
  name: project.name,
  status: 'ভবিষ্যৎ',
  detail: `${project.location} · ${project.units} · ${project.status}`,
});

export const plotProjects = [
  ...completedPlotProjects,
  ...ongoingProjects.filter((project) => project.name.includes('প্লট')).map((project) => toOngoingEntry(project, 'প্লট')),
  ...futureProjects.filter((project) => project.projectType.includes('প্লট')).map((project) => toFutureEntry(project, 'প্লট')),
];

export const flatProjects = [
  ...completedFlatProjects,
  ...ongoingProjects.filter((project) => project.name.includes('ফ্ল্যাট')).map((project) => toOngoingEntry(project, 'ফ্ল্যাট')),
  ...futureProjects.filter((project) => project.projectType.includes('ফ্ল্যাট') || project.units.includes('ফ্ল্যাট')).map((project) => toFutureEntry(project, 'ফ্ল্যাট')),
];

export const projectTypeSummaries = {
  plot: { total: '৪১', completed: '৩৩', ongoing: '৬', future: '২', units: '৬,০২৪', unitLabel: 'সমাপ্ত প্রকল্পের প্লট' },
  flat: { total: '৩৯', completed: '২৩', ongoing: '৮', future: '৮', units: '৬,৯১৮', unitLabel: 'সমাপ্ত প্রকল্পের ফ্ল্যাট' },
};
