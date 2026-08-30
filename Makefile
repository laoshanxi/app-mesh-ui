VER=3.0.0
DOCKER_IMG_NAME=laoshanxi/appmesh-ui

build:
	docker build --no-cache -t ${DOCKER_IMG_NAME}:${VER} -t ${DOCKER_IMG_NAME}:latest .

push:
	docker push ${DOCKER_IMG_NAME}:${VER}
	docker push ${DOCKER_IMG_NAME}:latest

# Register the UI container as an App Mesh app (exec user follows daemon BaseConfig.DefaultExecUser)
run:
	appm logon -U admin@appmesh.local
	-appm rm -a appweb -f
	appm add -a appweb -p 11 -Q restart -I ${DOCKER_IMG_NAME}:${VER} -e "APP_DOCKER_OPTS=--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -f

dev:
	npm install
	npm run dev

lint:
	npm run lint

clean:
	-docker rmi -f ${DOCKER_IMG_NAME}:${VER}
	-docker rmi -f ${DOCKER_IMG_NAME}:latest
