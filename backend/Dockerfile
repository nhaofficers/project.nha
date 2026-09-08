FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --filter @nha/backend... --frozen-lockfile=false
COPY backend backend
COPY database database
RUN pnpm --filter @nha/backend prisma:generate && pnpm --filter @nha/backend build

FROM node:22-bookworm-slim
RUN corepack enable
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/database ./database
WORKDIR /app/backend
USER node
CMD ["node", "dist/backend/src/main.js"]
