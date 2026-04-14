FROM node:18-alpine AS build

WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:5000
ARG REACT_APP_SOCKET_URL=http://localhost:5000

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL

COPY frontend/package*.json ./

RUN npm ci --legacy-peer-deps

COPY frontend/public ./public
COPY frontend/src ./src

RUN npm run build

FROM nginx:1.27-alpine AS production

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
