FROM node:18.1-slim

WORKDIR /app
COPY index.js package.json yarn.lock ./
RUN yarn 

CMD ["yarn", "start"]