#!/bin/sh

# The upstream URL is TLS-only: it carries the API bearer token, and
# default.conf proxies it as https. Reject another scheme here, before the wait
# below turns a scheme mistake into a misleading "unreachable" timeout. Only an
# unset value gets the Dockerfile default; an empty override is a mistake.
if [ -z "${APP_MESH_API_URL+x}" ]; then
	APP_MESH_API_URL="https://127.0.0.1:6060"
fi
case "$APP_MESH_API_URL" in
https://?*)
	;;
*)
	echo "appmesh-ui: APP_MESH_API_URL='$APP_MESH_API_URL' must be an https:// URL, for example https://127.0.0.1:6060 (the API upstream is TLS); exiting" >&2
	exit 1
	;;
esac

# Wait for the App Mesh upstream before nginx binds 443.
#
# The UI normally shares the daemon's network namespace (compose
# network_mode), so an unreachable loopback upstream means either the daemon
# is not ready yet (wait it out) or this container is attached to a stale
# namespace after a daemon restart (exit, so restart: always re-creates the
# container into the live namespace). A non-loopback upstream targets a
# remote daemon: nothing to wait for in this namespace.
case "$APP_MESH_API_URL" in
*127.0.0.1* | *localhost* | *"[::1]"*)
	i=0
	until curl -ksk -o /dev/null --max-time 2 "$APP_MESH_API_URL/"; do
		i=$((i + 1))
		if [ "$i" -ge 60 ]; then
			echo "appmesh-ui: upstream $APP_MESH_API_URL unreachable after ${i}s, exiting to re-attach the live namespace" >&2
			exit 1
		fi
		sleep 1
	done
	echo "appmesh-ui: upstream $APP_MESH_API_URL is ready"
	;;
*) ;;
esac
