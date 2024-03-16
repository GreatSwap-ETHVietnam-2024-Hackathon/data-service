# Dockerfile-data-service

FROM node:18

WORKDIR /data-service

COPY ./package*.json ./
RUN npm install

COPY . .

CMD npm run typechain-build && npm run start-prod

