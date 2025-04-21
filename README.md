[![language.badge]][language.url] [![release.badge]][release.url] [![docker.badge]][docker.url]

# App Mesh Web GUI

This is the Web GUI implementation for [App Mesh](https://github.com/laoshanxi/app-mesh).

<div align=center><img src="https://github.com/laoshanxi/picture/raw/master/appmesh/web-diagram.png" align=center /></div>

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
  -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro \
  -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro \
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
  -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro \
  -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro \
  laoshanxi/appmesh-ui
```

### Environment Variables

| Variable Name      | Description              | Default Value            |
| ------------------ | ------------------------ | ------------------------ |
| `APP_MESH_API_URL` | App Mesh API service URL | `https://127.0.0.1:6060` |
| `VUE_APP_TITLE`    | Web site title           | `App Mesh`               |

## Interface Preview

<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/1.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/2.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/3.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/4.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/5.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/6.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/7.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/8.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/9.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/a.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/b.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/c.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/d.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/e.png?raw=true" />

## License

This project is licensed under the [MIT](https://github.com/laoshanxi/app-mesh-ui/LICENSE) License.

[language.url]: https://nodejs.org/
[language.badge]: https://img.shields.io/badge/language-nodes.vue-blue.svg
[release.url]: https://github.com/laoshanxi/app-mesh/releases
[release.badge]: https://img.shields.io/github/v/release/laoshanxi/app-mesh-ui.svg
[docker.url]: https://hub.docker.com/repository/docker/laoshanxi/appmesh-ui
[docker.badge]: https://img.shields.io/docker/pulls/laoshanxi/appmesh-ui.svg
