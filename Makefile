RELEASE_DIR=./release
VER=1.0
NODE_VER=10.17.0-jessie

all:
	make buildnode
	make package

buildnode:
	docker run --rm --privileged -v `pwd`:/opt --workdir /opt node:${NODE_VER} sh -c "npm install; npm run build:prod"
	
package:
	-docker rm -f appweb
	-docker rmi -f appmanager-ui:${VER}
	docker build -t appmanager-ui:${VER} -f ./Dockerfile .
	
run:
	appc logon -u admin -x Admin123
	appc unreg -n appweb -f
	appc reg -n appweb -e APP_DOCKER_OPTS="-p 80:80 -p 443:443" -d appmanager-ui:1.0 -f
tar:
	docker save appmanager-ui:${VER}  -o  ./appmanager-ui.${VER}.tar
	tar czvf appmanager-ui.${VER}.tar.gz appmanager-ui.${VER}.tar

dev:
	git pull
	make
	make run
	
clean:
	-docker rm -f appweb
	-docker rmi -f appmanager-ui:${VER}
	rm -rf ./*.tar ./*.gz
	#rm -rf ./node_modules
