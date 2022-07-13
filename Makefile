VER=2.1.0
NODE_VER=10.17.0-stretch
DOCKER_IMG_NAME=appmesh-ui:${VER}

all:
	make buildnode
	make pack

buildnode:
	appc unreg -n appweb -f
	- docker rm -f ui_build
	docker run --name ui_build --rm -v `pwd`:/workspace -v `pwd`:/root --workdir /workspace node:${NODE_VER} sh -c "cd /workspace; npm config set cache /workspace; npm install; npm run build:prod"
	
pack:
	- docker rm -f appweb
	- docker rmi -f ${DOCKER_IMG_NAME}
	mkdir dockerbuild; cp -r nginx dist dockerbuild/ && docker build -t ${DOCKER_IMG_NAME} -f Dockerfile.local ./dockerbuild
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
	npm install
	npm run dev
	#This will automatically open http://localhost:9528

install_dep:
	sudo apt install -y nodejs npm

clean:
	-docker rm -f appweb
	-docker rmi -f ${DOCKER_IMG_NAME}
	rm -rf ./*.tar ./*.gz
	#rm -rf ./node_modules
