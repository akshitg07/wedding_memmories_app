# Wedding Memories

A container-first wedding photo and video gallery inspired by Immich, Apple Photos, Google Photos, Pinterest, Linear, and Arc. It includes a Next.js frontend, Express/TypeScript API, PostgreSQL/Prisma persistence, JWT authentication, local storage abstraction, admin analytics, uploads, likes, comments, albums, Docker Compose, tests, and API documentation.

## Run the app with Docker Compose

You only need Docker Compose on the host. The app, database, migrations, seed, API, frontend, and reverse proxy all run in containers.

```bash
cp .env.example .env
docker compose up --build -d
```

Open `http://localhost` and sign in with the admin credentials from `.env`.

## Container with `/mnt` media share

This repository includes a compose stack designed for a host-mounted media share. Create the host folders, copy or expose your Samba share there, and start the stack:

```bash
sudo mkdir -p /mnt/wedding-memories/library
sudo chown -R 1000:1000 /mnt/wedding-memories || true
docker compose -f docker-compose.mnt.yml up --build -d
```

- The API container mounts the host `/mnt` at container `/mnt`.
- Uploaded files are stored under `/mnt/wedding-memories/uploads`.
- Photos and videos you add manually or through Samba should go under `/mnt/wedding-memories/library`.
- After adding files to the share, sign in as an admin and call `POST /api/admin/import-library` to index new JPEG, PNG, WebP, HEIC, MP4, MOV, AVI, MKV, and WebM files without copying them.
- The API entrypoint runs Prisma generation, applies migrations, seeds the admin account, and then starts the server.

Services:
- `web`: Next.js responsive UI.
- `api`: Express API with security middleware, rate limiting, validation, and centralized errors.
- `postgres`: durable PostgreSQL database.
- `nginx`: reverse proxy for `/` and `/api`.
- volumes: `postgres_data`; media files are bind-mounted from host `/mnt`.

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
- `POST /admin/import-library` scans the mounted `MEDIA_LIBRARY_DIR` and imports files already placed on `/mnt` or a Samba share.

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

`StorageProvider` currently uses local disk under `STORAGE_DIR`, which defaults to `/mnt/wedding-memories` in containers. The interface is intentionally small (`save`, `read`, `delete`, `resolve`, `importExisting`) so S3, Cloudflare R2, MinIO, or NAS adapters can be dropped in without changing media controllers.

## Container checks

```bash
docker compose config
docker compose -f docker-compose.mnt.yml config
```
