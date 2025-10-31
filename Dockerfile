FROM node:20-alpine AS build
WORKDIR /usr/src/app
RUN apk add --no-cache postgresql-client
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]