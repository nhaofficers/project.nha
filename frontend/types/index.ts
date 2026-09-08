export type NamedRef = { id: string; name: string };

export type Project = {
  id: string; projectCode: string; projectName: string; location: string;
  description?: string; startDate?: string; endDate?: string; responsibleOfficer?: string;
  projectTypeId: string; projectStatusId: string;
  projectType?: NamedRef; projectStatus?: NamedRef;
  _count?: { events: number; photos: number };
};

export type PublicProject = Omit<Project, '_count'> & {
  coverPhotoId: string;
  _count: { photos: number };
};

export type EventRecord = {
  id: string; eventCode: string; eventName: string; eventDate: string; location: string;
  department?: string; responsibleOfficer?: string; description?: string;
  eventTypeId: string; activityTypeId?: string; projectId?: string;
  eventType?: NamedRef; activityType?: NamedRef; project?: Project;
  _count?: { photos: number };
};

export type Photo = {
  id: string; title: string; captureDate: string; status: string; description?: string;
  location?: string; photographer?: string; department?: string; remarks?: string;
  projectId?: string; eventId?: string; project?: Project; event?: EventRecord;
  tags?: { tag: NamedRef }[]; createdAt?: string;
};

export type PresentationTemplate = { id: string; name: string; description?: string; isActive?: boolean };
export type PresentationSlide = { id?: string; position: number; title?: string; caption?: string; photoIds: string[]; photos?: { photo: Photo }[] };
export type Presentation = { id: string; title: string; subtitle?: string; status: string; updatedAt: string; templateId: string; template?: PresentationTemplate; slides?: PresentationSlide[]; _count?: { slides: number } };
