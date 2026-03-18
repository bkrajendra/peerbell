FROM node:20-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
ARG VITE_API_BASE=/api
ARG VITE_PEER_HOST=localhost
ARG VITE_PEER_PORT=80
ARG VITE_PEER_PATH=/peerjs
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY infra/nginx/frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
