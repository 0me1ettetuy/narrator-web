FROM node:22-alpine AS build

WORKDIR /app

ARG DATABASE_URL_DIRECT
ENV DATABASE_URL_DIRECT=$DATABASE_URL_DIRECT

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schema/package.json packages/schema/
COPY apps/server/package.json apps/server/

RUN corepack enable
RUN pnpm install --frozen-lockfile


COPY tsconfig.base.json ./
COPY packages/schema packages/schema/
COPY apps/server apps/server/

RUN pnpm --filter @narrator/server... build
RUN cp -R apps/server/src/db/generated apps/server/dist/db/generated

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/packages/schema packages/schema/
COPY --from=build /app/apps/server apps/server/
COPY --from=build /app/node_modules node_modules/

EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]
