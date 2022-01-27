FROM node:10.17.0-stretch AS builder
WORKDIR /workspace
COPY . .
RUN npm install && npm run build:prod


FROM nginx:mainline-alpine

COPY --from=builder /workspace/dist/ /usr/share/nginx/html/
COPY --from=builder /workspace/nginx/* /etc/nginx/conf.d/
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
