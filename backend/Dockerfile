FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY backend ./backend

EXPOSE 5000

CMD ["node", "backend/server.js"]
