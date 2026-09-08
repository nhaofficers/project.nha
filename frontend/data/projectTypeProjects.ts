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

const COMPLETED_SOURCE_URL = 'https://nha.gov.bd/pages/static-pages/6922dbbc933eb65569e0c2e7';

const completedPlotProjects: ProjectTypeEntry[] = completedProjects
  .filter((project) => project.plots !== '—')
  .map((project) => ({
    id: `completed-${project.serial}`,
    name: project.name,
    status: 'সমাপ্ত',
    detail: `${project.plots}টি প্লট · সমাপ্তির সন ${project.year}`,
    sourceUrl: COMPLETED_SOURCE_URL,
  }));

const completedFlatProjects: ProjectTypeEntry[] = completedProjects
  .filter((project) => project.flats !== '—')
  .map((project) => ({
    id: `completed-${project.serial}`,
    name: project.name,
    status: 'সমাপ্ত',
    detail: `${project.flats}টি ফ্ল্যাট · সমাপ্তির সন ${project.year}`,
    sourceUrl: COMPLETED_SOURCE_URL,
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
  plot: { total: '৩০', completed: '২২', ongoing: '৬', future: '২', units: '৫,০৯০', unitLabel: 'সমাপ্ত প্রকল্পের প্লট' },
  flat: { total: '২৮', completed: '১২', ongoing: '৮', future: '৮', units: '২,৪৫৯', unitLabel: 'সমাপ্ত প্রকল্পের ফ্ল্যাট' },
};
