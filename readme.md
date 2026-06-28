# Wedding Memories

A production-oriented wedding photo and video gallery inspired by Immich, Apple Photos, Google Photos, Pinterest, Linear, and Arc. It includes a Next.js frontend, Express/TypeScript API, PostgreSQL/Prisma persistence, JWT authentication, local storage abstraction, admin analytics, uploads, likes, comments, albums, Docker Compose, tests, and API documentation.

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma db push --schema apps/api/prisma/schema.prisma
npm --workspace apps/api run dev
npm --workspace apps/web run dev
```

Seed the first admin:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD='ChangeMe123!' tsx apps/api/src/seed.ts
```

## Docker production stack

```bash
docker compose up --build
```

Services:
- `web`: Next.js responsive UI.
- `api`: Express API with security middleware, rate limiting, validation, and centralized errors.
- `postgres`: durable PostgreSQL database.
- `nginx`: reverse proxy for `/` and `/api`.
- volumes: `postgres_data`, `uploads`.

## API documentation

### Auth
- `POST /auth/login` with `{ username, password }` returns an access token and secure refresh cookie.
- `GET /auth/me` returns the authenticated principal.

### Media
- `GET /media?search=&type=&albumId=&skip=&take=` lists ready media with uploader and engagement counts.
- `POST /media` accepts multipart `files[]`, validates MIME type and size, stores originals, and deduplicates by SHA-256.
- `GET /media/:id/download` downloads original quality and increments download count.
- `POST /media/:id/like` likes a memory.
- `POST /media/:id/comments` creates a comment.

### Albums
- `GET /albums` lists browseable albums.

### Admin
- `GET /admin/stats` returns users, media, likes, comments, and storage usage.
- `POST /admin/users` creates users.
- `PATCH /admin/users/:id` disables users, changes display names, or resets passwords.
- `DELETE /admin/media/:id` moderates and removes uploads.

## Architecture

- `apps/web`: Next.js App Router UI with Tailwind, React Query, Axios, dark mode, glassmorphism, responsive cards, upload entry points, gallery search, album browsing, login, profile, and admin dashboards.
- `apps/api`: Express API organized by domain modules with Prisma repositories, DTO validation via Zod, JWT RBAC, bcrypt password hashing, local storage provider abstraction, upload validation, and admin endpoints.
- `apps/api/prisma/schema.prisma`: PostgreSQL models for users, roles, media, albums, likes, comments, tags, notifications, activity logs, and settings.

## Security notes

- Passwords are hashed with bcrypt.
- Access tokens are short lived and refresh tokens are stored in HTTP-only cookies.
- Helmet, CORS, JSON limits, and rate limiting are enabled.
- Prisma prevents SQL injection for ORM queries.
- Uploads are MIME and size checked; the storage layer exposes a virus-scanning integration point before promotion to `READY`.
- Admin routes are protected by role-based middleware.

## Storage adapters

`StorageProvider` currently uses local disk. The interface is intentionally small (`save`, `read`, `delete`) so S3, Cloudflare R2, MinIO, or NAS adapters can be dropped in without changing media controllers.

## Tests

```bash
npm --workspaces run test
npm --workspaces run lint
```
