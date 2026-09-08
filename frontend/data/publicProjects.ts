import type { Photo, PublicProject } from '@/types';

const projectStatusId = 'cde5b686-f865-4f8f-987f-c63c676b4a2b';
const projectTypeId = '1ac9e223-96ea-4e98-9bd9-18eba8a5524e';

const createProject = (id: string, projectCode: string, projectName: string, location: string, coverPhotoId: string): PublicProject => ({
  id,
  projectCode,
  projectName,
  location,
  coverPhotoId,
  projectStatusId,
  projectTypeId,
  description: 'জাতীয় গৃহায়ন কর্তৃপক্ষের অফিসিয়াল ওয়েবসাইটে প্রকাশিত প্রকল্প।',
  _count: { photos: 1 },
});

export const publicProjectFallbacks: PublicProject[] = [
  createProject('4d430927-0fe1-4dcc-987b-99756cd95001', 'NHA-OFFICIAL-003', 'মিরপুর ১১ নম্বর সেকশনে বস্তিবাসীদের জন্য ৫৩৩টি ভাড়া ভিত্তিক আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'মিরপুর ১১, ঢাকা', '88e2cea4-95ee-428a-8825-fcbbaf0fa666'),
  createProject('a1c490de-4328-41fd-8a9d-b20340931b32', 'NHA-OFFICIAL-006', 'মোহাম্মদপুর এফ ব্লকে সরকারি ও স্বায়ত্তশাসিত সংস্থার কর্মকর্তাদের জন্য ৩৬০টি ফ্ল্যাট নির্মাণ প্রকল্প', 'মোহাম্মদপুর, ঢাকা', '5fbb8ac9-9f49-4632-be3b-48ef25ecd84e'),
  createProject('b74120f5-6e0f-4e62-a925-28df8395b4eb', 'NHA-OFFICIAL-002', 'লালমাটিয়া হাউজিং এস্টেটে সরকারি কর্মকর্তাদের জন্য ১৫৩টি আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'লালমাটিয়া, ঢাকা', '8de4c9aa-861e-45fa-89a7-6199d565b007'),
  createProject('8db450da-688a-4d3f-8dd0-597737cc5a39', 'NHA-OFFICIAL-001', 'সিলেট শহরে সীমিত আয়ের মানুষের আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'সিলেট', '1ebe0824-8568-4827-b775-48c92a848b9c'),
  createProject('3ec64619-b7ce-4393-bf5c-542d376e8eff', 'NHA-OFFICIAL-004', 'সুনামগঞ্জে সাইটস অ্যান্ড সার্ভিসেস আবাসিক প্লট উন্নয়ন প্রকল্প', 'সুনামগঞ্জ', '6cc00b05-cca9-4a6c-9d5c-c6b2053b0d9d'),
  createProject('78789ce7-b279-4873-ad96-0be368294a1b', 'NHA-OFFICIAL-005', 'স্বপ্ননগর আবাসিক ফ্ল্যাট প্রকল্প-১: মিরপুর ৯ নম্বর সেকশনে ১০৪০টি ফ্ল্যাট নির্মাণ', 'মিরপুর ৯, ঢাকা', '5e73422b-f9fe-43ef-b6d8-24f2f7c4e668'),
];

export const publicPhotoFallbacks: Photo[] = publicProjectFallbacks.map((project) => ({
  id: project.coverPhotoId,
  projectId: project.id,
  title: project.projectName,
  description: 'জাতীয় গৃহায়ন কর্তৃপক্ষের অনুমোদিত প্রকল্পচিত্র।',
  captureDate: '2024-12-01T00:00:00Z',
  location: project.location,
  department: 'জাতীয় গৃহায়ন কর্তৃপক্ষ',
  status: 'APPROVED',
}));
