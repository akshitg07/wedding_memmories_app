import { createRequire } from 'node:module';
import express, { type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './common/env.js';
import { errorHandler } from './common/errors.js';
import { login, me, requireAuth } from './auth/auth.js';
import { mediaRouter } from './media/media.js';
import { adminRouter } from './admin/admin.js';
import { prisma } from './common/prisma.js';

const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http') as () => RequestHandler;

export const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use(pinoHttp());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/auth/login', login);
app.get('/auth/me', requireAuth, me);
app.use('/media', mediaRouter);
app.get('/albums', requireAuth, async (_req, res) => res.json({ items: await prisma.album.findMany({ orderBy: { title: 'asc' } }) }));
app.use('/admin', adminRouter);
app.use(errorHandler);

app.listen(env.PORT, () => console.log(`api listening on ${env.PORT}`));
