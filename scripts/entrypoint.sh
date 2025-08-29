#!/bin/sh

# Replace placeholders in index.html using sed
env | while IFS='=' read -r name value; do
  sed -i "s|__${name}__|${value}|g" /opt/app/static/index.html
done

# Start Nginx
echo "** Running nginx"
/usr/sbin/nginx