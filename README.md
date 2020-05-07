# Web GUI for Applicaton Manager

[Applicaton Manager](https://github.com/laoshanxi/app-manager)

<div align=center>
<img src="https://raw.githubusercontent.com/laoshanxi/app-manager-ui/master/doc/diagram.png"width=434 height=334/>
</div>

## Build Setup

```bash
git clone https://github.com/laoshanxi/app-manager-ui.git

cd app-manager-ui

# build
make

# develop
make run
```

Visit http://localhost

## Build Docker image
```bash
make tar
```

## Develop

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
tar zxvf appmgr-ui.1.8.1.tar.gz
docker load -i appmgr-ui.1.8.1.tar
appc reg -n appweb -e APP_DOCKER_OPTS="--net=host -v /opt/appmanager/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmanager/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -c "nginx -g 'daemon off;'" -d appmgr-ui:1.8.1 -f
```

## Demo

<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/1.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/2.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/3.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/4.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/5.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/6.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/7.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/8.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/9.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/a.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/b.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/c.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/d.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/e.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/f.png" />
<img src="https://raw.githubusercontent.com/laoshanxi/picture/master/appmgr/g.png" />

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[MIT](https://github.com/laoshanxi/app-manager-ui/LICENSE) license.

Copyright (c) 2019-present lip0091981
