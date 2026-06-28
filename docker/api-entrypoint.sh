#!/bin/sh
set -e

npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma || npx prisma db push --schema apps/api/prisma/schema.prisma
node apps/api/dist/seed.js
exec node apps/api/dist/server.js
