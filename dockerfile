FROM nginx:1.19.4-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/. /usr/share/nginx/html
COPY certs/. /etc/ssl/
