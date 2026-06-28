import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../common/prisma.js';
import { requireAdmin, requireAuth } from '../auth/auth.js';
import { importLibrary } from './import-library.js';

const safeUserSelect = { id: true, username: true, displayName: true, role: true, disabled: true } as const;

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', async (_req, res) => {
  const [users, media, likes, comments] = await Promise.all([prisma.user.count(), prisma.media.count(), prisma.like.count(), prisma.comment.count()]);
  const storage = await prisma.media.aggregate({ _sum: { size: true } });
  res.json({ users, media, likes, comments, storageBytes: storage._sum.size?.toString() ?? '0' });
});

adminRouter.post('/users', async (req, res) => {
  const b = z.object({ username: z.string().min(2), password: z.string().min(8), displayName: z.string().min(1), role: z.enum(['ADMIN', 'USER']).default('USER') }).parse(req.body);
  res.status(201).json(await prisma.user.create({ data: { username: b.username, displayName: b.displayName, role: b.role, passwordHash: await bcrypt.hash(b.password, 12) }, select: safeUserSelect }));
});

adminRouter.patch('/users/:id', async (req, res) => {
  const b = z.object({ disabled: z.boolean().optional(), displayName: z.string().optional(), password: z.string().min(8).optional() }).parse(req.body);
  res.json(await prisma.user.update({ where: { id: req.params.id }, data: { disabled: b.disabled, displayName: b.displayName, passwordHash: b.password ? await bcrypt.hash(b.password, 12) : undefined }, select: safeUserSelect }));
});

adminRouter.delete('/media/:id', async (req, res) => {
  await prisma.media.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

adminRouter.post('/import-library', async (req, res) => {
  res.status(202).json(await importLibrary(req.user!.id));
});
