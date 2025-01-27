FROM node:18 AS builder
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod

FROM nginx:mainline-alpine

RUN mkdir /etc/nginx/templates/
COPY --from=builder /workspace/dist/ /usr/share/nginx/html/

COPY nginx/server.* /etc/nginx/conf.d/
COPY nginx/default.conf.template /etc/nginx/templates/

COPY nginx/config.js.template /usr/share/nginx/html/config.js.template
COPY nginx/config.sh /docker-entrypoint.d/99-custom-config.sh
RUN chmod +x /docker-entrypoint.d/99-custom-config.sh
ENV VUE_APP_TITLE="App Mesh"

ENV APP_MESH_API_URL=https://127.0.0.1:6060
EXPOSE 443
