FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl && corepack enable && corepack prepare yarn@4.5.3 --activate
COPY package.json .yarnrc.yml ./
COPY apps/api/package.json apps/api/package.json
RUN yarn install
FROM deps AS build
COPY apps/api apps/api
RUN yarn workspace @wedding/api build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/api apps/api
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh
EXPOSE 4000
CMD ["api-entrypoint.sh"]
