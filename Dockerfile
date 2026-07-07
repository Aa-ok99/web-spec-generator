FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json backend/
RUN cd backend && npm ci

COPY backend/ backend/
COPY frontend/ frontend/

RUN cd backend && npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/backend/dist backend/dist/
COPY --from=builder /app/backend/node_modules backend/node_modules/
COPY --from=builder /app/backend/package.json backend/
COPY --from=builder /app/frontend frontend/

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "backend/dist/server.js"]
