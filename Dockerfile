FROM node:10.17.0-stretch AS builder
WORKDIR /workspace
COPY . .
RUN npm install && npm run build:prod

FROM nginx:mainline-alpine

RUN mkdir /etc/nginx/templates/
COPY --from=builder /workspace/dist/ /usr/share/nginx/html/
COPY --from=builder /workspace/nginx/server.* /etc/nginx/conf.d/
COPY --from=builder /workspace/nginx/default.conf.template /etc/nginx/templates/
ENV APP_MESH_SERVER_HOST=127.0.0.1
EXPOSE 443
