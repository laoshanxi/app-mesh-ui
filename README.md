[![language.badge]][language.url] [![release.badge]][release.url] [![docker.badge]][docker.url]

# Web GUI for App Mesh

[App Mesh](https://github.com/laoshanxi/app-mesh)

<div align=center>
<img src="https://raw.githubusercontent.com/laoshanxi/app-mesh-ui/master/doc/diagram.png"width=434 height=334/>
</div>


## Build Docker image
```bash
make
make tar
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
```bash
tar zxvf appmesh-ui.1.8.3.tar.gz
docker load -i appmesh-ui.1.8.3.tar
appc reg -n appweb -e APP_DOCKER_OPTS="--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -c "nginx -g 'daemon off;'" -d appmesh-ui:1.8.3 -f
```

## Demo

<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/1.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/2.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/3.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/4.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/5.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/6.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/7.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/8.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/9.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/a.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/b.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/c.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/d.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/e.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/f.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmesh/g.png" />

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[MIT](https://github.com/laoshanxi/app-mesh-ui/LICENSE) license.

Copyright (c) 2019-present lip0091981


[language.url]:   https://nodejs.org/
[language.badge]: https://img.shields.io/badge/language-vue-blue.svg

[release.url]:    https://github.com/laoshanxi/app-mesh/releases
[release.badge]:  https://img.shields.io/github/v/release/laoshanxi/app-mesh-ui.svg

[docker.url]:    https://hub.docker.com/repository/docker/laoshanxi/appmesh-ui
[docker.badge]:  https://img.shields.io/docker/pulls/laoshanxi/appmesh-ui.svg