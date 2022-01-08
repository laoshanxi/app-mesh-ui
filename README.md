[![language.badge]][language.url] [![release.badge]][release.url] [![docker.badge]][docker.url]

# Web GUI for App Mesh

[App Mesh](https://github.com/laoshanxi/app-mesh)

<div align=center>
<img src="https://raw.githubusercontent.com/laoshanxi/app-mesh-ui/main/doc/diagram.png"width=434 height=334/>
</div>


## Build Docker image
```bash
VER=2.0.1
cd appmesh-ui/
make

docker rmi laoshanxi/appmesh-ui:${VER} || true
docker tag appmesh-ui:${VER} laoshanxi/appmesh-ui:${VER}
docker push laoshanxi/appmesh-ui:${VER}

docker tag laoshanxi/appmesh-ui:${VER} laoshanxi/appmesh-ui:latest
docker push laoshanxi/appmesh-ui:latest
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
```


## Deploy
Use host mode networking for Nginx reverse proxy (need accept host 443 port)
```shell
appc reg -n appweb --perm 11 --exit restart -e APP_DOCKER_OPTS="--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -d laoshanxi/appmesh-ui:2.0.1 -f
```
Or use Docker native API way to manage container app:
```shell
tee appweb.json <<-'EOF'
{
    "Image": "ubuntu",
    "HostConfig": {
        "NetworkMode": "host",
        "Binds": [
            "/opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro",
            "/opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro"
        ]
    }
}
EOF
appc reg -n appweb --perm 11 --exit restart -g @./appweb.json -d laoshanxi/appmesh-ui:2.0.1
```

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
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/f.png?raw=true" />
<img src="https://github.com/laoshanxi/picture/blob/master/appmesh/g.png?raw=true" />

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE10, IE11, Edge                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                                 | last 2 versions                                                                                                                                                                                             | last 2 versions                                                                                                                                                                                             |

## License

[MIT](https://github.com/laoshanxi/app-mesh-ui/LICENSE) license.


[language.url]:   https://nodejs.org/
[language.badge]: https://img.shields.io/badge/language-nodes.vue-blue.svg

[release.url]:    https://github.com/laoshanxi/app-mesh/releases
[release.badge]:  https://img.shields.io/github/v/release/laoshanxi/app-mesh-ui.svg

[docker.url]:    https://hub.docker.com/repository/docker/laoshanxi/appmesh-ui
[docker.badge]:  https://img.shields.io/docker/pulls/laoshanxi/appmesh-ui.svg
