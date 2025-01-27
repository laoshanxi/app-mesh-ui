#!/bin/sh

# Generate config.js from template
envsubst </usr/share/nginx/html/config.js.template >/usr/share/nginx/html/config.js
