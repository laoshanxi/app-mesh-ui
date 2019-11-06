RELEASE_DIR=./release

all:
	npm install --registry=https://registry.npm.taobao.org --disturl=https://npm.taobao.org/mirrors/node
	npm run build:prod
	chmod +x ./server/*.sh
	mkdir -p ${RELEASE_DIR}
	cp -r ./dist ${RELEASE_DIR}/
	cp -r ./server ${RELEASE_DIR}/
	
deb:
	rm -f *.deb
	fpm -s dir -t deb -v ${VERSION} -n ${PACKAGE_NAME} -d 'psmisc' --vendor ${VENDER} --description ${VENDER} --post-install ${TMP_DIR}/script/install.sh --before-remove ${TMP_DIR}/script/pre_uninstall.sh --after-remove ${TMP_DIR}/script/uninstall.sh -C ${RELEASE_DIR}
rpm:
	rm -f *.rpm
	fpm -s dir -t rpm -v ${VERSION} -n ${PACKAGE_NAME} -d 'psmisc' --vendor ${VENDER} --description ${VENDER} --post-install ${TMP_DIR}/script/install.sh --before-remove ${TMP_DIR}/script/pre_uninstall.sh --after-remove ${TMP_DIR}/script/uninstall.sh -C ${RELEASE_DIR}

clean:
	rm -rf ${RELEASE_DIR}
