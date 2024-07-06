FROM node:current

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV TELEGRAM_BOT_TOKEN=
ENV URL_APP=
ENV TELEGRAM_CHANNEL=

CMD ["node", "index.js"]