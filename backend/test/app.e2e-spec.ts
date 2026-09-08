import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';

describe('NHA DPAMS real database flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let storage: StorageService;
  let adminToken: string;
  let viewerToken: string;
  let photoId: string;
  let image: Buffer;
  let storageKey = '';
  let thumbnailKey = '';

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    storage = app.get(StorageService);
    const color = randomBytes(3);
    image = await sharp({ create: { width: 80, height: 60, channels: 3, background: { r: color[0]!, g: color[1]!, b: color[2]! } } }).jpeg().toBuffer();
  });

  afterAll(async () => {
    if (photoId) await prisma.photo.deleteMany({ where: { id: photoId } });
    if (storageKey) await storage.remove(storageKey);
    if (thumbnailKey) await storage.remove(thumbnailKey);
    await app.close();
  });

  it('logs in and rotates the refresh token', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'super.admin@example.invalid', password: process.env.SEED_USER_PASSWORD }).expect(201);
    adminToken = login.body.accessToken as string;
    const firstCookie = login.headers['set-cookie']?.[0] as string;
    expect(adminToken).toBeTruthy();
    expect(firstCookie).toContain('nha_refresh=');
    const refresh = await request(app.getHttpServer()).post('/api/v1/auth/refresh').set('Cookie', firstCookie).expect(201);
    expect(refresh.body.accessToken).toBeTruthy();
    expect(refresh.headers['set-cookie']?.[0]).not.toEqual(firstCookie);
    await request(app.getHttpServer()).post('/api/v1/auth/refresh').set('Cookie', firstCookie).expect(401);
  });

  it('enforces role permissions', async () => {
    const viewer = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'viewer@example.invalid', password: process.env.SEED_USER_PASSWORD }).expect(201);
    viewerToken = viewer.body.accessToken as string;
    await request(app.getHttpServer()).post('/api/v1/projects').set('Authorization', `Bearer ${viewerToken}`).send({}).expect(403);
    await request(app.getHttpServer()).get('/api/v1/photos').expect(401);
    await request(app.getHttpServer()).post('/api/v1/photos/upload').set('Authorization', `Bearer ${viewerToken}`).field('metadata', JSON.stringify({ title: 'Unauthorized', captureDate: '2026-09-06' })).attach('file', image, { filename: 'unauthorized.jpg', contentType: 'image/jpeg' }).expect(403);
  });

  it('uploads, detects a duplicate, approves, searches, and downloads', async () => {
    const metadata = JSON.stringify({ title: 'E2E archive photograph', captureDate: '2026-09-06', tags: ['e2e', 'verified'] });
    const uploaded = await request(app.getHttpServer()).post('/api/v1/photos/upload').set('Authorization', `Bearer ${adminToken}`).field('metadata', metadata).attach('file', image, { filename: 'e2e.jpg', contentType: 'image/jpeg' }).expect(201);
    photoId = uploaded.body.id as string;
    storageKey = uploaded.body.storageKey as string;
    thumbnailKey = uploaded.body.thumbnailKey as string;
    expect(photoId).toBeTruthy();
    await request(app.getHttpServer()).get(`/api/v1/photos/${photoId}`).set('Authorization', `Bearer ${viewerToken}`).expect(404);
    await request(app.getHttpServer()).post(`/api/v1/photos/${photoId}/approve`).set('Authorization', `Bearer ${viewerToken}`).send({}).expect(403);
    await request(app.getHttpServer()).post('/api/v1/photos/upload').set('Authorization', `Bearer ${adminToken}`).field('metadata', metadata).attach('file', image, { filename: 'e2e.jpg', contentType: 'image/jpeg' }).expect(409);
    await request(app.getHttpServer()).post(`/api/v1/photos/${photoId}/approve`).set('Authorization', `Bearer ${adminToken}`).send({ note: 'E2E approved' }).expect(201);
    const search = await request(app.getHttpServer()).get('/api/v1/search/photos?q=E2E').set('Authorization', `Bearer ${viewerToken}`).expect(200);
    expect(search.body.data.some((photo: { id: string }) => photo.id === photoId)).toBe(true);
    const download = await request(app.getHttpServer()).get(`/api/v1/photos/${photoId}/download`).set('Authorization', `Bearer ${viewerToken}`).expect(200);
    expect(download.headers['content-type']).toContain('image/webp');
  });

  it('rejects disguised executable uploads', async () => {
    const metadata = JSON.stringify({ title: 'Invalid upload', captureDate: '2026-09-06' });
    await request(app.getHttpServer()).post('/api/v1/photos/upload').set('Authorization', `Bearer ${adminToken}`).field('metadata', metadata).attach('file', Buffer.from('MZ executable content'), { filename: 'malware.jpg', contentType: 'image/jpeg' }).expect(400);
  });

  it('returns 404 for missing media without terminating the API', async () => {
    await storage.remove(thumbnailKey);
    thumbnailKey = '';
    await request(app.getHttpServer()).get(`/api/v1/photos/${photoId}/thumbnail`).set('Authorization', `Bearer ${adminToken}`).expect(404);
    await request(app.getHttpServer()).get('/api/v1/dashboard').set('Authorization', `Bearer ${adminToken}`).expect(200);
  });
});
