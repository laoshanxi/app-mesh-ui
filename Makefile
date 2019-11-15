RELEASE_DIR=./release
VER=1.0

all:
	make buildnode
	make package

buildnode:
	docker run -ti -p 9825:9825 --rm --privileged -v `pwd`:/opt node:10.17.0-jessie sh -c "cd /opt; npm install; npm run build:prod"
	
package:
	docker rmi -f appmanager-ui:${VER}
	docker build -t appmanager-ui:${VER} -f ./Dockerfile .
	
run:
	docker rm -f appmanager-ui
	docker run -d -p 6061:80 --name appmgr-web appmanager-ui:${VER}
	
tar:
	docker save appmanager-ui:${VER}  -o  ./appmanager-ui.${VER}.tar
	tar czvf appmanager-ui.${VER}.tar.gz appmanager-ui.${VER}.tar
	
clean:
	docker rm -f appmanager-ui
	docker rmi -f appmanager-ui:${VER}
	rm -rf *.tar
