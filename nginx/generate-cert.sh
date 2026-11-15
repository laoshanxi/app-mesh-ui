#!/bin/sh

# One-time TLS material per container start: the image no longer bakes a
# key shared by every deployment. Generate a throwaway self-signed certificate
# unless the operator mounted one at the paths below (same as the appmesh
# daemon, which self-signs on every start).
CRT=/etc/nginx/conf.d/server.crt
KEY=/etc/nginx/conf.d/server.key

# APP_MESH_TLS_REGEN=1: drop an existing generated pair so a restart of a
# persistent container also rotates the key (mounted certificates win anyway).
[ "${APP_MESH_TLS_REGEN:-0}" = "1" ] && rm -f "$CRT" "$KEY"

if [ -s "$CRT" ] && [ -s "$KEY" ]; then
	echo "appmesh-ui: using provided TLS certificate $CRT"
	exit 0
fi

# SAN: loopback names only; APP_MESH_TLS_SAN (comma separated) appends the
# deployment's own names, e.g. APP_MESH_TLS_SAN=appmesh-ui.example.com,10.0.0.5
SAN="DNS:localhost,IP:127.0.0.1"
if [ -n "${APP_MESH_TLS_SAN:-}" ]; then
	OLDIFS=$IFS
	IFS=','
	for entry in $APP_MESH_TLS_SAN; do
		case "$entry" in
		*:*) SAN="$SAN,IP:$entry" ;; # IPv6
		[0-9]*.[0-9]*.[0-9]*.[0-9]*) SAN="$SAN,IP:$entry" ;; # IPv4
		*) SAN="$SAN,DNS:$entry" ;;
		esac
	done
	IFS=$OLDIFS
fi

openssl req -x509 -newkey rsa:2048 -sha256 -days 825 -nodes \
	-subj "/CN=appmesh-ui" \
	-keyout "$KEY" -out "$CRT" \
	-addext "subjectAltName=$SAN" \
	-addext "basicConstraints=critical,CA:FALSE" \
	-addext "keyUsage=critical,digitalSignature,keyEncipherment" \
	-addext "extendedKeyUsage=serverAuth" || exit 1
chmod 600 "$KEY"
echo "appmesh-ui: generated self-signed certificate ($SAN)"
