# app-manager-ui

English | [简体中文](./README-zh.md)

> The WEB GUI for laoshanxi/app-manager


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

Visit http://localhost:6066

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

## Demo

## Extra
```bash
# register to app manager
appc reg -c "sh -c 'docker rm -f appweb; docker run --rm -p 6066:80 --name appweb appmanager-ui:1.0'" -n appweb -f
```

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[MIT](https://github.com/laoshanxi/app-manager-ui/LICENSE) license.

Copyright (c) 2019-present lip0091981
