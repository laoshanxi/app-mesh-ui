# Deliberate LTS pin: node 20 is EOL, newer lines are non-LTS (see dependabot.yml)
FROM node:22-alpine AS builder
WORKDIR /workspace
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm cache clean --force
COPY . .
RUN npm run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /workspace/dist/ /workspace/nginx/config.js.template ./
# No baked TLS key: 97-generate-cert.sh self-signs at startup unless a
# certificate is mounted at /etc/nginx/conf.d/server.{crt,key}
COPY nginx/default.conf.template /etc/nginx/templates/
COPY nginx/generate-cert.sh /docker-entrypoint.d/97-generate-cert.sh
COPY nginx/wait-upstream.sh /docker-entrypoint.d/98-wait-upstream.sh
COPY nginx/config.sh /docker-entrypoint.d/99-custom-config.sh
# openssl: startup certificate generation; libcap: setcap lets the
# unprivileged nginx user bind 443 — port and healthcheck stay unchanged.
# chown: runtime-writable paths for the entrypoint scripts (cert + config.js
# generation) and the nginx worker temp dirs.
RUN apk add --no-cache curl openssl libcap && \
    chmod +x /docker-entrypoint.d/97-generate-cert.sh /docker-entrypoint.d/98-wait-upstream.sh /docker-entrypoint.d/99-custom-config.sh && \
    setcap cap_net_bind_service=+ep /usr/sbin/nginx && \
    chown -R nginx:nginx /var/cache/nginx /run /etc/nginx/conf.d /usr/share/nginx/html
# nginx master and workers run unprivileged
USER nginx
# PROXY_SSL_VERIFY: "off" (default) accepts the daemon's self-signed upstream
# certificate; set "on" together with APP_MESH_API_CA to reject a MITM-ed
# upstream — see README "Environment Variables" for the trade-off
# UI_PUBLIC_HOST: hostname whose Host header the 497 http->https bounce may
# echo back with its port (default: a reserved, never-resolvable placeholder,
# so only loopback hosts are whitelisted); set it when the UI is published
# behind a real hostname. Any value must be plain hostname[:port] characters.
ENV VUE_APP_TITLE="App Mesh" APP_MESH_API_URL="https://127.0.0.1:6060" APP_MESH_AUTH_URL="http://127.0.0.1:6065" APP_MESH_ADMIN_UI_URL="http://127.0.0.1:6068" PROXY_SSL_VERIFY="off" UI_PUBLIC_HOST="unset.invalid"
HEALTHCHECK --interval=30s --timeout=3s --start-period=65s --retries=3 \
    CMD curl -fsk https://localhost:443/health >/dev/null 2>&1 || exit 1
EXPOSE 443
