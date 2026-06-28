FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.5.3 --activate
COPY package.json .yarnrc.yml ./
COPY apps/web/package.json apps/web/package.json
RUN yarn install
FROM deps AS build
COPY apps/web apps/web
RUN yarn workspace @wedding/web build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/web apps/web
EXPOSE 3000
CMD ["./node_modules/.bin/next","start","apps/web"]
