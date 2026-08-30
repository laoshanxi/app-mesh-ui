VER=3.0.0
DOCKER_IMG_NAME=laoshanxi/appmesh-ui

# Stage the JS SDK from the sibling app-mesh repository (local reference until
# the Dex/OIDC SDK is published to npm). Both dev and docker builds need it
# inside this directory so the build context is self-contained.
sdk:
	@test -d ../app-mesh/src/sdk/javascript || (echo "../app-mesh/src/sdk/javascript not found: clone the app-mesh repo next to app-mesh-ui"; exit 1)
	rm -rf third_party/appmesh-sdk
	mkdir -p third_party
	cp -R ../app-mesh/src/sdk/javascript third_party/appmesh-sdk
	rm -rf third_party/appmesh-sdk/node_modules third_party/appmesh-sdk/dist third_party/appmesh-sdk/test

build: sdk
	docker build --no-cache -t ${DOCKER_IMG_NAME}:${VER} -t ${DOCKER_IMG_NAME}:latest .

push:
	docker push ${DOCKER_IMG_NAME}:${VER}
	docker push ${DOCKER_IMG_NAME}:latest

# Register the UI container as an App Mesh app (exec user follows daemon BaseConfig.DefaultExecUser)
run:
	appm logon -U admin@appmesh.local
	-appm rm -a appweb -f
	appm add -a appweb -p 11 -Q restart -I ${DOCKER_IMG_NAME}:${VER} -e "APP_DOCKER_OPTS=--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -f

dev: sdk
	npm install
	npm run dev

lint:
	npm run lint

clean:
	-docker rmi -f ${DOCKER_IMG_NAME}:${VER}
	-docker rmi -f ${DOCKER_IMG_NAME}:latest
