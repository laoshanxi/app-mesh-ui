RELEASE_DIR=./release

all:
	chmod +x ./server/*.sh
	mkdir -p ${RELEASE_DIR}
	cp -r ./dist ${RELEASE_DIR}/
	cp -r ./server ${RELEASE_DIR}/

build:
	docker run -ti -p 9825:9825 --rm --privileged -v $(pwd):/opt node:10.17.0-jessie sh -c "cd /opt; npm install; npm run build:prod"
	
package:
	
clean:
	rm -rf ${RELEASE_DIR}
