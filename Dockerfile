FROM node:alpine

WORKDIR /app
COPY index.js package.json yarn.lock ./
RUN yarn 

CMD ["yarn", "start"]