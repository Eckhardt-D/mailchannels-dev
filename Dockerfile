FROM node:22-alpine AS base

WORKDIR /app

COPY package.json ./

RUN npm install -g corepack@latest
RUN corepack enable
RUN corepack install

FROM base AS installer

WORKDIR /app

RUN pnpm install -s

FROM base AS builder

WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM builder AS runner

WORKDIR /app

RUN pnpm prune -s --prod

EXPOSE 8008

CMD ["node", "dist/index.js"]

