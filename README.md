[![language.badge]][language.url] [![release.badge]][release.url] [![docker.badge]][docker.url]

# App Mesh Web GUI

This is the Web GUI implementation for [App Mesh](https://github.com/laoshanxi/app-mesh).

<div align=center><img src="https://github.com/laoshanxi/picture/raw/master/appmesh/web-diagram.svg" align=center /></div>

## Features

- Modern web interface built with Vue.js
- Visual management for all App Mesh core functionalities
- Intuitive application monitoring and management interface
- Quick deployment via Docker container

## Development Guide

### Environment Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Preview production build
npm run preview

# Preview with bundle analyzer report
npm run preview -- --report

# Lint code
npm run lint

# Lint and auto-fix
npm run lint -- --fix
```

### Build Docker Image

```bash
docker build -t appmesh-ui .
```

## Deployment Guide

### Method 1: Connect to Local App Mesh

```shell
docker run \
  --name=appmesh-ui \
  -d \
  --restart=always \
  -p 443:443 \
  -e APP_MESH_API_URL=https://`hostname`:6060 \
  -e VUE_APP_TITLE=`hostname` \
  laoshanxi/appmesh-ui
```

### Method 2: Host Network Mode

When App Mesh runs on the host OS, use this recommended command:

```shell
docker run \
  --name=appmesh-ui \
  -d \
  --restart=always \
  --net=host \
  -e VUE_APP_TITLE=`hostname` \
  laoshanxi/appmesh-ui
```

### Environment Variables

| Variable Name       | Description                                                                                                        | Default Value            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| `APP_MESH_API_URL`  | App Mesh API service URL                                                                                           | `https://127.0.0.1:6060` |
| `APP_MESH_AUTH_URL` | OIDC (Dex) issuer URL proxied under `/auth/`                                                                       | `http://127.0.0.1:6062`  |
| `VUE_APP_TITLE`     | Web site title                                                                                                     | `App Mesh`               |
| `APP_MESH_TLS_SAN`  | Extra certificate SANs (comma separated DNS names/IPs) for the startup self-signed certificate                      | _(empty)_                |
| `APP_MESH_TLS_REGEN`| `1` regenerates the certificate on every container start even if one persists                                      | `0`                      |
| `PROXY_SSL_VERIFY`  | Verify the API upstream TLS certificate (`on` requires `APP_MESH_API_CA`)                                          | `off`                    |
| `APP_MESH_API_CA`   | CA bundle file (mount it in) that signs the API upstream certificate, used when `PROXY_SSL_VERIFY=on`              | _(empty)_                |

### TLS Certificate

The image ships no TLS key. On startup the container self-signs a throwaway
certificate (`SAN=localhost,127.0.0.1` plus `APP_MESH_TLS_SAN`), so every
deployment gets its own key — the same model as the appmesh daemon. To serve a
trusted certificate instead, mount both halves; a mounted certificate always
wins. Note the container runs nginx unprivileged (uid 101), so mounted key
files must be readable by uid 101 (`chmod o+r` on the host key):

```shell
  -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro \
  -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro \
```

### Upstream TLS Verification

`PROXY_SSL_VERIFY=off` (default) accepts the daemon's self-signed certificate
but also lets an attacker on the container network impersonate the API upstream
and steal bearer tokens. For a CA-signed upstream, enable verification:

```shell
  -e PROXY_SSL_VERIFY=on \
  -e APP_MESH_API_CA=/certs/ca.pem \
  -v /path/to/ca.pem:/certs/ca.pem:ro \
```

## Interface Preview

### Login

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/login.png?raw=true" />

### Applications

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/applications.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/app-detail.png?raw=true" />

### Compute

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/run-shell.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/run-task.png?raw=true" />

### AI & Workflow

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/workflow.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/agent-chat.png?raw=true" />

### Host & File Management

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/host.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/files.png?raw=true" />

### Security

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/security-principals.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/security-roles.png?raw=true" />

### Monitoring & Configuration

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/prometheus.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/ui/config.png?raw=true" />

## License

This project is licensed under the [MIT](https://github.com/laoshanxi/app-mesh-ui/LICENSE) License.

[language.url]: https://nodejs.org/
[language.badge]: https://img.shields.io/badge/language-nodes.vue-blue.svg
[release.url]: https://github.com/laoshanxi/app-mesh/releases
[release.badge]: https://img.shields.io/github/v/release/laoshanxi/app-mesh-ui.svg
[docker.url]: https://hub.docker.com/repository/docker/laoshanxi/appmesh-ui
[docker.badge]: https://img.shields.io/docker/pulls/laoshanxi/appmesh-ui.svg
