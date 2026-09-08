import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createReadStream } from 'node:fs';
import { access, mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

@Injectable()
export class StorageService {
  readonly root = resolve(process.env.STORAGE_PATH ?? '../storage');

  private pathFor(key: string) {
    const path = resolve(this.root, key);
    if (path !== this.root && !path.startsWith(`${this.root}${sep}`)) throw new Error('Invalid storage key');
    return path;
  }
  async put(key: string, bytes: Buffer) { const path = this.pathFor(key); await mkdir(dirname(path), { recursive: true }); await writeFile(path, bytes, { flag: 'wx' }); return path; }
  stream(key: string) { return createReadStream(this.pathFor(key)); }
  async exists(key: string) { try { await access(this.pathFor(key)); return true; } catch { return false; } }
  fullPath(key: string) { return this.pathFor(key); }
  async remove(key: string) { try { await unlink(this.pathFor(key)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } }
  async size(prefix = ''): Promise<number> {
    const path = this.pathFor(prefix);
    try {
      const entries = await readdir(path, { withFileTypes: true });
      return (await Promise.all(entries.map(async (entry) => entry.isDirectory() ? this.size(`${prefix}/${entry.name}`) : (await stat(resolve(path, entry.name))).size))).reduce((a, b) => a + b, 0);
    } catch { return 0; }
  }
  @Cron('0 */15 * * * *')
  async cleanupTemporaryFiles() {
    const cutoff = Date.now() - Number(process.env.TEMP_RETENTION_MINUTES ?? 60) * 60_000;
    for (const directory of ['temp/zip', 'temp/presentations', 'temp/processing']) {
      const path = this.pathFor(directory);
      try {
        for (const entry of await readdir(path, { withFileTypes: true })) {
          if (!entry.isFile()) continue;
          const target = resolve(path, entry.name);
          if ((await stat(target)).mtimeMs < cutoff) await unlink(target);
        }
      } catch { /* directory may not exist yet */ }
    }
  }
}
