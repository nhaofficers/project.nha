import type { Photo, PublicProject } from '@/types';

const projectStatusId = 'cde5b686-f865-4f8f-987f-c63c676b4a2b';
const projectTypeId = '1ac9e223-96ea-4e98-9bd9-18eba8a5524e';

const createProject = (
  id: string,
  projectCode: string,
  projectName: string,
  location: string,
  photoIds: string[],
  description = 'জাতীয় গৃহায়ন কর্তৃপক্ষের অফিসিয়াল ওয়েবসাইটে প্রকাশিত প্রকল্প।',
): PublicProject => ({
  id,
  projectCode,
  projectName,
  location,
  coverPhotoId: photoIds[0]!,
  projectStatusId,
  projectTypeId,
  description,
  _count: { photos: photoIds.length },
});

const presentationDescription = 'প্রদত্ত “Complete plot” উপস্থাপনা থেকে সংগৃহীত সমাপ্ত প্লট প্রকল্পের অনুমোদিত আলোকচিত্র।';

const photoIdsByProject: Record<string, string[]> = {
  '4d430927-0fe1-4dcc-987b-99756cd95001': ['88e2cea4-95ee-428a-8825-fcbbaf0fa666'],
  'a1c490de-4328-41fd-8a9d-b20340931b32': ['5fbb8ac9-9f49-4632-be3b-48ef25ecd84e'],
  'b74120f5-6e0f-4e62-a925-28df8395b4eb': ['8de4c9aa-861e-45fa-89a7-6199d565b007'],
  '8db450da-688a-4d3f-8dd0-597737cc5a39': ['1ebe0824-8568-4827-b775-48c92a848b9c'],
  '3ec64619-b7ce-4393-bf5c-542d376e8eff': ['6cc00b05-cca9-4a6c-9d5c-c6b2053b0d9d', 'completed-plot-24-01'],
  '78789ce7-b279-4873-ad96-0be368294a1b': ['5e73422b-f9fe-43ef-b6d8-24f2f7c4e668'],
  'completed-plot-23': ['completed-plot-23-01', 'completed-plot-23-02', 'completed-plot-23-03', 'completed-plot-23-04', 'completed-plot-23-05', 'completed-plot-23-06'],
  'completed-plot-07': ['completed-plot-07-01'],
  'completed-plot-27': ['completed-plot-27-01'],
  'completed-plot-31': ['completed-plot-31-01'],
};

export const publicProjectFallbacks: PublicProject[] = [
  createProject('4d430927-0fe1-4dcc-987b-99756cd95001', 'NHA-OFFICIAL-003', 'মিরপুর ১১ নম্বর সেকশনে বস্তিবাসীদের জন্য ৫৩৩টি ভাড়া ভিত্তিক আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'মিরপুর ১১, ঢাকা', photoIdsByProject['4d430927-0fe1-4dcc-987b-99756cd95001']!),
  createProject('a1c490de-4328-41fd-8a9d-b20340931b32', 'NHA-OFFICIAL-006', 'মোহাম্মদপুর এফ ব্লকে সরকারি ও স্বায়ত্তশাসিত সংস্থার কর্মকর্তাদের জন্য ৩৬০টি ফ্ল্যাট নির্মাণ প্রকল্প', 'মোহাম্মদপুর, ঢাকা', photoIdsByProject['a1c490de-4328-41fd-8a9d-b20340931b32']!),
  createProject('b74120f5-6e0f-4e62-a925-28df8395b4eb', 'NHA-OFFICIAL-002', 'লালমাটিয়া হাউজিং এস্টেটে সরকারি কর্মকর্তাদের জন্য ১৫৩টি আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'লালমাটিয়া, ঢাকা', photoIdsByProject['b74120f5-6e0f-4e62-a925-28df8395b4eb']!),
  createProject('8db450da-688a-4d3f-8dd0-597737cc5a39', 'NHA-OFFICIAL-001', 'সিলেট শহরে সীমিত আয়ের মানুষের আবাসিক ফ্ল্যাট নির্মাণ প্রকল্প', 'সিলেট', photoIdsByProject['8db450da-688a-4d3f-8dd0-597737cc5a39']!),
  createProject('3ec64619-b7ce-4393-bf5c-542d376e8eff', 'NHA-OFFICIAL-004', 'সুনামগঞ্জে সাইট অ্যান্ড সার্ভিসেস আবাসিক প্লট উন্নয়ন প্রকল্প', 'সুনামগঞ্জ', photoIdsByProject['3ec64619-b7ce-4393-bf5c-542d376e8eff']!),
  createProject('78789ce7-b279-4873-ad96-0be368294a1b', 'NHA-OFFICIAL-005', 'স্বপ্ননগর আবাসিক ফ্ল্যাট প্রকল্প-১: মিরপুর ৯ নম্বর সেকশনে ১০৪০টি ফ্ল্যাট নির্মাণ', 'মিরপুর ৯, ঢাকা', photoIdsByProject['78789ce7-b279-4873-ad96-0be368294a1b']!),
  createProject('completed-plot-23', 'NHA-COMPLETED-PLOT-023', 'রাজশাহী জেলার তেরখাদিয়ায় স্বল্প ও মধ্যম আয়ের মানুষের জন্য আবাসিক প্লট উন্নয়ন প্রকল্প', 'তেরখাদিয়া, রাজশাহী', photoIdsByProject['completed-plot-23']!, presentationDescription),
  createProject('completed-plot-07', 'NHA-COMPLETED-PLOT-007', 'মৌলভীবাজার জেলায় স্বল্প ও মধ্যম আয়ের মানুষের জন্য আবাসিক প্লট উন্নয়ন প্রকল্প', 'মৌলভীবাজার', photoIdsByProject['completed-plot-07']!, presentationDescription),
  createProject('completed-plot-27', 'NHA-COMPLETED-PLOT-027', 'পিরোজপুর জেলার সদর উপজেলায় স্বল্প ও মধ্যম আয়ের মানুষের জন্য সাইট অ্যান্ড সার্ভিসেস আবাসিক প্লট উন্নয়ন প্রকল্প', 'পিরোজপুর সদর', photoIdsByProject['completed-plot-27']!, presentationDescription),
  createProject('completed-plot-31', 'NHA-COMPLETED-PLOT-031', 'ঝালকাঠি জেলার নলছিটি উপজেলায় সাইট অ্যান্ড সার্ভিসেস আবাসিক প্লট উন্নয়ন প্রকল্প', 'নলছিটি, ঝালকাঠি', photoIdsByProject['completed-plot-31']!, presentationDescription),
];

export const publicPhotoFallbacks: Photo[] = publicProjectFallbacks.flatMap((project) =>
  photoIdsByProject[project.id]!.map((photoId, index) => {
    const fromPresentation = photoId.startsWith('completed-plot-');
    return {
      id: photoId,
      projectId: project.id,
      title: photoIdsByProject[project.id]!.length > 1 ? `${project.projectName} — ছবি ${(index + 1).toLocaleString('bn-BD')}` : project.projectName,
      description: fromPresentation ? presentationDescription : 'জাতীয় গৃহায়ন কর্তৃপক্ষের অনুমোদিত প্রকল্পচিত্র।',
      captureDate: fromPresentation ? '' : '2024-12-01T00:00:00Z',
      location: project.location,
      department: 'জাতীয় গৃহায়ন কর্তৃপক্ষ',
      status: 'APPROVED',
    };
  }),
);
