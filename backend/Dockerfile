FROM node:20-alpine AS test

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm test \
	&& printf '\033[32m✓ Backend tests passed\033[0m\n' \
	&& touch /tmp/backend-tests-passed

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
COPY --from=test /tmp/backend-tests-passed /tmp/backend-tests-passed

EXPOSE 5000

CMD ["node", "server.js"]
