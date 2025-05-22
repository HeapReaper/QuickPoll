FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

EXPOSE 3333

CMD ["sh", "-c", "node ace migration:run --force && node build/bin/server.js"]
