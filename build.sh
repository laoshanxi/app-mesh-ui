
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root"
    exit 1
fi

npm install

npm run build:prod

rm -rf release
mkdir release

cd release
cp -r ../dist ./
cp -r ../server ./
