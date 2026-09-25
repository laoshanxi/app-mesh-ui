VER=3.0.0
DOCKER_IMG_NAME=laoshanxi/appmesh-ui

build:
	docker build --no-cache -t ${DOCKER_IMG_NAME}:${VER} -t ${DOCKER_IMG_NAME}:latest .

push:
	docker push ${DOCKER_IMG_NAME}:${VER}
	docker push ${DOCKER_IMG_NAME}:latest

# Run the UI container against a daemon on this host. host.docker.internal rather
# than --net=host: a container's 127.0.0.1 is its own network namespace, so the
# daemon's loopback-bound 6060/6062/6064 stay unreachable (Docker Desktop for Mac
# maps --net=host to the Linux VM). --add-host makes the name resolve on plain
# Linux Docker too. The image's built-in cert already covers https://localhost;
# where /opt/appmesh/ssl is shared with Docker, mount server.{pem,key} over
# conf.d/server.{crt,key} to serve the daemon's own certificate instead.
run:
	-docker rm -f appmesh-ui
	docker run -d --name appmesh-ui --restart=always -p 443:443 \
		--add-host=host.docker.internal:host-gateway \
		-e APP_MESH_API_URL=https://host.docker.internal:6060 \
		-e APP_MESH_AUTH_URL=http://host.docker.internal:6062 \
		-e APP_MESH_ADMIN_UI_URL=http://host.docker.internal:6064 \
		${DOCKER_IMG_NAME}:latest

dev:
	npm install
	npm run dev

lint:
	npm run lint

clean:
	-docker rmi -f ${DOCKER_IMG_NAME}:${VER}
	-docker rmi -f ${DOCKER_IMG_NAME}:latest
