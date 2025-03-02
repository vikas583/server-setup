FROM node:20.17.0-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "npm", "start" ]
