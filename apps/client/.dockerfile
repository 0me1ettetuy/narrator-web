FROM node:22-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./apps/client/package.json ./apps/client/
COPY ./apps/server/package.json ./apps/server/
COPY ./packages/schema/package.json ./packages/schema/

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .

ENV DATABASE_URL_DIRECT="postgresql://user:password@localhost:5432/narrator"

RUN pnpm --filter @narrator/schema build
RUN pnpm --filter @narrator/server build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN pnpm --filter @narrator/client build

FROM nginx:alpine AS runtime

COPY --from=build /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80
