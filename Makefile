RELEASE_DIR=./release
VER=1.0

all:
	chmod +x ./server/*.sh
	mkdir -p ${RELEASE_DIR}
	cp -r ./dist ${RELEASE_DIR}/
	cp -r ./server ${RELEASE_DIR}/

build:
	docker run -ti -p 9825:9825 --rm --privileged -v $(pwd):/opt node:10.17.0-jessie sh -c "cd /opt; npm install; npm run build:prod"
	
package:
	docker rmi appmanager-ui:${VER}
	docker build -t appmanager-ui:${VER} -f ./Dockerfile .
	
run:
	docker rm -f appmanager-ui
	docker run -d -p 6061:80 --name appmgr-web appmanager-ui:${VER}
	
clean:
	rm -rf ${RELEASE_DIR}
