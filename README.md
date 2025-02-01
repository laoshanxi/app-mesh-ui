[![language.badge]][language.url] [![release.badge]][release.url] [![docker.badge]][docker.url]

# Web GUI for App Mesh

Web GUI for [App Mesh](https://github.com/laoshanxi/app-mesh)

<div align=center>
<img src="https://raw.githubusercontent.com/laoshanxi/app-mesh-ui/main/doc/diagram.png" width=434 height=334 alt="Architecture"/>
</div>

## Development

## Build Docker image

```bash
docker build -t appmesh-ui .
```

## Develop environment

```bash
# preview the release environment effect
npm run preview

# preview the release environment effect + static resource analysis
npm run preview -- --report

# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix

# run development
npm run dev
```

## Deploy

- Use docker to start a container connected to local App Mesh

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

The following environment variables can be used to customize the deployment:

| Variable           | Description                  | Default Value            |
| ------------------ | ---------------------------- | ------------------------ |
| `APP_MESH_API_URL` | The App Mesh API service URL | `https://127.0.0.1:6060` |
| `VUE_APP_TITLE`    | The Web Site Title           | `App Mesh`               |

## Demo

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

[MIT](https://github.com/laoshanxi/app-mesh-ui/LICENSE) license.

[language.url]: https://nodejs.org/
[language.badge]: https://img.shields.io/badge/language-nodes.vue-blue.svg
[release.url]: https://github.com/laoshanxi/app-mesh/releases
[release.badge]: https://img.shields.io/github/v/release/laoshanxi/app-mesh-ui.svg
[docker.url]: https://hub.docker.com/repository/docker/laoshanxi/appmesh-ui
[docker.badge]: https://img.shields.io/docker/pulls/laoshanxi/appmesh-ui.svg
