FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
RUN npm install
FROM deps AS build
COPY apps/web apps/web
RUN npm --workspace apps/web run build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/web apps/web
EXPOSE 3000
CMD ["npm","--workspace","apps/web","run","start"]
