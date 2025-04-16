FROM node:20

WORKDIR /app

COPY apps/frontend/package*.json ./

ENV npm_config_arch=arm64
ENV NODE_ENV=development

RUN npm install rollup

COPY apps/frontend ./

EXPOSE 4000
CMD ["npm", "run", "dev"]
