#!/bin/sh
set -e

./node_modules/.bin/prisma generate --schema apps/api/prisma/schema.prisma
./node_modules/.bin/prisma migrate deploy --schema apps/api/prisma/schema.prisma || ./node_modules/.bin/prisma db push --schema apps/api/prisma/schema.prisma
node apps/api/dist/seed.js
exec node apps/api/dist/server.js
