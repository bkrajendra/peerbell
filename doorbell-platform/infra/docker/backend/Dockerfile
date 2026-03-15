FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend ./
RUN npm run build
RUN mkdir -p /app/data
EXPOSE 8080
CMD ["npm","start"]
