import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../common/prisma.js';
import { env } from '../common/env.js';
import { storage } from '../storage/local.js';

const mimeByExtension: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    if (!entry.isFile()) return [];
    return [absolutePath];
  }));
  return nested.flat();
}

export async function importLibrary(adminUserId: string) {
  await fs.mkdir(env.MEDIA_LIBRARY_DIR, { recursive: true });
  const files = await walk(env.MEDIA_LIBRARY_DIR);
  let imported = 0;
  let skipped = 0;

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeByExtension[ext];
    if (!mimeType) {
      skipped += 1;
      continue;
    }

    const stat = await fs.stat(filePath);
    const importedObject = await storage.importExisting(filePath);
    const existing = await prisma.media.findUnique({ where: { checksum: importedObject.checksum } });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.media.create({
      data: {
        filename: path.basename(filePath),
        originalName: path.basename(filePath),
        mimeType,
        type: mimeType.startsWith('image/') ? 'IMAGE' : 'VIDEO',
        size: BigInt(stat.size),
        checksum: importedObject.checksum,
        storageKey: importedObject.key,
        status: 'READY',
        uploaderId: adminUserId,
      },
    });
    imported += 1;
  }

  return { imported, skipped, scanned: files.length, libraryDir: env.MEDIA_LIBRARY_DIR };
}
