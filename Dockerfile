# Build from the repository root:
#   docker build -t qlue-api .
#   docker run --env-file apps/api/.env -p 3000:3000 qlue-api

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

COPY apps/api/src ./apps/api/src
RUN pnpm --filter api build

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --prod --filter api...

COPY --from=build /app/apps/api/dist ./apps/api/dist

EXPOSE 3000
CMD ["pnpm", "--filter", "api", "start"]
