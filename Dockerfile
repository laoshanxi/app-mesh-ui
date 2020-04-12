FROM nginx:mainline-alpine

# html
COPY dist/ /usr/share/nginx/html/
COPY nginx/* /etc/nginx/conf.d/

# PORT
EXPOSE 8443
# EXPOSE 80
# EXPOSE 443
