import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const permissions = [
  'USER_VIEW','USER_CREATE','USER_EDIT','USER_DELETE','PROJECT_VIEW','PROJECT_CREATE','PROJECT_EDIT','PROJECT_DELETE',
  'EVENT_VIEW','EVENT_CREATE','EVENT_EDIT','EVENT_DELETE','PHOTO_VIEW','PHOTO_UPLOAD','PHOTO_EDIT','PHOTO_APPROVE','PHOTO_REJECT','PHOTO_DOWNLOAD','PHOTO_DELETE',
  'PRESENTATION_CREATE','PRESENTATION_EDIT','PRESENTATION_GENERATE','PRESENTATION_DOWNLOAD','AUDIT_VIEW','SYSTEM_SETTINGS',
];
const rolePermissions: Record<string, string[]> = {
  'Super Admin': permissions,
  Admin: permissions.filter((p) => p !== 'USER_DELETE'),
  Reviewer: ['PROJECT_VIEW','EVENT_VIEW','PHOTO_VIEW','PHOTO_EDIT','PHOTO_APPROVE','PHOTO_REJECT','PHOTO_DOWNLOAD','PRESENTATION_DOWNLOAD'],
  Contributor: ['PROJECT_VIEW','PROJECT_CREATE','EVENT_VIEW','EVENT_CREATE','PHOTO_VIEW','PHOTO_UPLOAD','PHOTO_EDIT','PHOTO_DOWNLOAD'],
  'Presentation Manager': ['PROJECT_VIEW','EVENT_VIEW','PHOTO_VIEW','PHOTO_DOWNLOAD','PRESENTATION_CREATE','PRESENTATION_EDIT','PRESENTATION_GENERATE','PRESENTATION_DOWNLOAD'],
  Viewer: ['PROJECT_VIEW','EVENT_VIEW','PHOTO_VIEW','PHOTO_DOWNLOAD','PRESENTATION_DOWNLOAD'],
};

async function main() {
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword || seedPassword.length < 12 || seedPassword === 'replace-before-seeding') throw new Error('Set SEED_USER_PASSWORD to a unique value of at least 12 characters');
  for (const code of permissions) await prisma.permission.upsert({ where: { code }, update: {}, create: { code, description: code.toLowerCase().replaceAll('_', ' ') } });
  for (const [name, codes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name, isSystem: true } });
    const grants = await prisma.permission.findMany({ where: { code: { in: codes } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({ data: grants.map((permission) => ({ roleId: role.id, permissionId: permission.id })), skipDuplicates: true });
  }
  const passwordHash = await argon2.hash(seedPassword);
  for (const [index, roleName] of Object.keys(rolePermissions).entries()) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const slug = roleName.toLowerCase().replaceAll(' ', '.');
    const user = await prisma.user.upsert({ where: { email: `${slug}@example.invalid` }, update: {}, create: { email: `${slug}@example.invalid`, displayName: `Demo ${roleName}`, department: 'Demonstration', passwordHash } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
    if (index === 0) console.log(`Seeded administrator: ${user.email}`);
  }
  const projectTypes = ['Apartment Project','Site and Services','Housing Estate'];
  const statuses = ['Planning','In Progress','Completed','On Hold'];
  const eventTypes = ['Inspection','Meeting','Ceremony','Training','Official Visit'];
  const activityTypes = ['Construction Progress','Project Inspection','Inauguration','Workshop','National Day'];
  await Promise.all(projectTypes.map((name) => prisma.projectType.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(statuses.map((name) => prisma.projectStatus.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(eventTypes.map((name) => prisma.eventType.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(activityTypes.map((name) => prisma.activityType.upsert({ where: { name }, update: {}, create: { name } })));
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'super.admin@example.invalid' } });
  const projectType = await prisma.projectType.findFirstOrThrow(); const status = await prisma.projectStatus.findFirstOrThrow();
  const locations = ['Uttara, Dhaka','Mirpur, Dhaka','Chattogram','Rajshahi','Khulna'];
  for (let i = 1; i <= 5; i++) await prisma.project.upsert({ where: { projectCode: `NHA-PRJ-${String(i).padStart(3, '0')}` }, update: {}, create: { projectCode: `NHA-PRJ-${String(i).padStart(3, '0')}`, projectName: `Sample Housing Project ${i}`, projectTypeId: projectType.id, projectStatusId: status.id, location: locations[i - 1]!, description: 'Fictional development seed record', createdById: admin.id } });
  const projects = await prisma.project.findMany({ take: 5 }); const eventType = await prisma.eventType.findFirstOrThrow(); const activityType = await prisma.activityType.findFirstOrThrow();
  for (let i = 1; i <= 10; i++) await prisma.event.upsert({ where: { eventCode: `NHA-EVT-${String(i).padStart(3, '0')}` }, update: {}, create: { eventCode: `NHA-EVT-${String(i).padStart(3, '0')}`, eventName: `Sample Official Activity ${i}`, eventTypeId: eventType.id, activityTypeId: activityType.id, projectId: projects[(i - 1) % projects.length]!.id, eventDate: new Date(Date.UTC(2026, i % 9, Math.min(i + 2, 28))), location: locations[(i - 1) % locations.length]!, department: 'Demonstration', createdById: admin.id } });
  const templates = ['Project Progress','Project Inspection','Official Visit','Inauguration','Event/Ceremony','National Day','Monthly Activities','Annual Activities','Executive Briefing'];
  await Promise.all(templates.map((name) => prisma.presentationTemplate.upsert({ where: { name }, update: {}, create: { name, description: `${name} standard NHA layout`, layout: { ratio: '16:9', brandColor: '#0B6B45', maxPhotosPerSlide: 4 } } })));
  const settings = { IMAGE_MAX_WIDTH: '1920', IMAGE_MAX_HEIGHT: '1920', WEBP_QUALITY: '80', THUMBNAIL_SIZE: '480', TEMP_RETENTION_MINUTES: '60', STORAGE_WARNING_PERCENT: '70', STORAGE_CRITICAL_PERCENT: '90' };
  await Promise.all(Object.entries(settings).map(([key, value]) => prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } })));
}

main().finally(() => prisma.$disconnect());
