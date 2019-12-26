# Web GUI for Applicaton Manager

[Applicaton Manager](https://github.com/laoshanxi/app-manager)

<div align=center>
<img src="https://raw.githubusercontent.com/laoshanxi/app-manager-ui/master/doc/diagram.png"width=434 height=334/>
</div>

## Build Setup

```bash
# clone the project
git clone https://github.com/laoshanxi/app-manager-ui.git

# enter the project directory
cd app-manager-ui

# build
make

# develop
make run
```

Visit http://localhost

## Build Docker image package
```bash
make tar
```

## Advanced

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


## Extra
```bash
# register to app manager

# option1 : shell process
appc reg -c "sh -c 'docker rm -f appweb; docker run --rm -p 6066:80 --name appweb appmanager-ui:1.0'" -n appweb -f
# option2 : native docker process
appc reg -n appweb -e APP_DOCKER_OPTS="-p 6066:80" -c "nginx -g 'daemon off;'" -d appmanager-ui:1.0 -f
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

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[MIT](https://github.com/laoshanxi/app-manager-ui/LICENSE) license.

Copyright (c) 2019-present lip0091981
