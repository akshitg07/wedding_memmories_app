import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../common/env.js';

export interface StoredObject {
  key: string;
  checksum: string;
  absolutePath: string;
}

export interface StorageProvider {
  save(buffer: Buffer, ext: string): Promise<StoredObject>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  resolve(key: string): string;
  importExisting(absolutePath: string): Promise<StoredObject>;
}

async function checksumFile(absolutePath: string) {
  const buffer = await fs.readFile(absolutePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function ensureInsideStorage(root: string, key: string) {
  const resolved = path.resolve(root, key);
  const normalizedRoot = path.resolve(root);
  if (!resolved.startsWith(`${normalizedRoot}${path.sep}`) && resolved !== normalizedRoot) {
    throw new Error('Invalid storage key');
  }
  return resolved;
}

export class LocalStorageProvider implements StorageProvider {
  async save(buffer: Buffer, ext: string) {
    await fs.mkdir(env.STORAGE_DIR, { recursive: true });
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const key = `uploads/${checksum}${ext}`;
    const absolutePath = this.resolve(key);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer, { flag: 'wx' }).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EEXIST') throw error;
    });
    return { key, checksum, absolutePath };
  }

  read(key: string) {
    return fs.readFile(this.resolve(key));
  }

  delete(key: string) {
    return fs.unlink(this.resolve(key));
  }

  resolve(key: string) {
    return ensureInsideStorage(env.STORAGE_DIR, key);
  }

  async importExisting(absolutePath: string) {
    const resolvedPath = path.resolve(absolutePath);
    const normalizedLibrary = path.resolve(env.MEDIA_LIBRARY_DIR);
    if (!resolvedPath.startsWith(`${normalizedLibrary}${path.sep}`) && resolvedPath !== normalizedLibrary) {
      throw new Error('Imported files must be inside MEDIA_LIBRARY_DIR');
    }
    const checksum = await checksumFile(resolvedPath);
    const relative = path.relative(env.STORAGE_DIR, resolvedPath);
    const key = relative.startsWith('..') ? `library/${path.basename(resolvedPath)}` : relative;
    return { key, checksum, absolutePath: resolvedPath };
  }
}

export const storage = new LocalStorageProvider();
