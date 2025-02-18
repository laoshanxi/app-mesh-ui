FROM node:18 AS builder
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod && \
    npm prune --production

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /workspace/dist/ /workspace/nginx/config.js.template ./
COPY nginx/server.* /etc/nginx/conf.d/
COPY nginx/default.conf.template /etc/nginx/templates/
COPY nginx/config.sh /docker-entrypoint.d/99-custom-config.sh
RUN apk add --no-cache curl && \
    mkdir -p /etc/nginx/templates/ && \
    rm -rf /var/cache/apk/* && \
    chmod +x /docker-entrypoint.d/99-custom-config.sh
ENV VUE_APP_TITLE="App Mesh" APP_MESH_API_URL="https://127.0.0.1:6060" PROXY_SSL_VERIFY="off"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -fsk https://localhost:443/health >/dev/null 2>&1 || exit 1
EXPOSE 443
