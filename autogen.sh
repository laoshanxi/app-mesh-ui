export ROOTDIR=`pwd`

if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root"
    exit 1
fi

#RHEL
if [ -f "/usr/bin/yum" ]; then
	yum install -y nodejs
	yum install -y npm
fi

#Ubuntu
if [ -f "/usr/bin/apt" ]; then
	sudo apt install -y nodejs
	sudo apt install -y npm
fi


#RHEL
if [ -f "/usr/bin/yum" ]; then
	yum install -y make
	yum install -y ruby rubygems ruby-devel
	yum install -y rpm-build
fi

#Ubuntu
if [ -f "/usr/bin/apt" ]; then
	apt install -y make alien
	apt install -y ruby ruby-dev rubygems
fi

npm install -g npm