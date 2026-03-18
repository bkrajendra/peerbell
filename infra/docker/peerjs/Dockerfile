FROM node:20-alpine
WORKDIR /app
RUN npm init -y && npm i peer
COPY infra/docker/peerjs/server.js /app/server.js
EXPOSE 9000
CMD ["node","server.js"]
