VER=3.0.0
NODE_VER=20
DOCKER_IMG_NAME=laoshanxi/appmesh-ui

build:
	docker build --no-cache -t ${DOCKER_IMG_NAME}:${VER} -t ${DOCKER_IMG_NAME}:latest .

push:
	docker push ${DOCKER_IMG_NAME}:${VER}
	docker push ${DOCKER_IMG_NAME}:latest

run:
	appc logon -u admin -x admin123
	appc unreg -n appweb -f
	appc reg -n appweb --perm 11 --exit restart -u root -e APP_DOCKER_OPTS="--net=host -v /opt/appmesh/ssl/server.pem:/etc/nginx/conf.d/server.crt:ro -v /opt/appmesh/ssl/server-key.pem:/etc/nginx/conf.d/server.key:ro" -d "${DOCKER_IMG_NAME}:${VER}" -f

dev:
	npm install --legacy-peer-deps
	npm run dev

clean:
	-docker rmi -f ${DOCKER_IMG_NAME}:${VER}
	-docker rmi -f ${DOCKER_IMG_NAME}:latest
