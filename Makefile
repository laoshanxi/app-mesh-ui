RELEASE_DIR=./release
VER=2.0.1
NODE_VER=10.17.0-stretch
DOCKER_IMG_NAME=appmesh-ui:${VER}

all:
	make buildnode
	make package

buildnode:
	appc unreg -n appweb -f
	- docker rm -f ui_build
	docker run --name ui_build --rm -v `pwd`:/workspace --workdir /workspace node:${NODE_VER} sh -c "npm install; npm run build:prod"
	
package:
	- docker rm -f appweb
	- docker rmi -f ${DOCKER_IMG_NAME}
	docker build -t ${DOCKER_IMG_NAME} -f ./Dockerfile .
	- docker rmi -f laoshanxi/appmesh-ui:${VER}
	- docker rmi -f laoshanxi/appmesh-ui
	docker tag ${DOCKER_IMG_NAME} laoshanxi/appmesh-ui:${VER}
	docker tag laoshanxi/appmesh-ui:${VER} laoshanxi/appmesh-ui:latest

push:
	docker push laoshanxi/appmesh-ui:${VER}
	docker push laoshanxi/appmesh-ui:latest

run:
	appc logon -u admin -x admin123
	appc unreg -n appweb -f
	# use host mode for nginx reverse proxy redirect to 6060/8500
	appc reg -n appweb --perm 11 --exit restart -u root -e APP_DOCKER_OPTS="--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -d "laoshanxi/appmesh-ui:${VER}" -f

dev:
	git pull
	make
	make run
	
clean:
	-docker rm -f appweb
	-docker rmi -f ${DOCKER_IMG_NAME}
	rm -rf ./*.tar ./*.gz
	#rm -rf ./node_modules