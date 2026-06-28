FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
RUN npm install
FROM deps AS build
COPY apps/api apps/api
RUN npm --workspace apps/api run build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/api apps/api
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh
EXPOSE 4000
CMD ["api-entrypoint.sh"]
