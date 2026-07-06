FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node

CMD ["node", "src/index.js"]
