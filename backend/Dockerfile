FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY backend/. ./

RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "server.js"]
