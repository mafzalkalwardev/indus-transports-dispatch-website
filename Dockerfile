FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
LABEL org.opencontainers.image.source="https://github.com/mafzalkalwardev/indus-transports-dispatch-website"
CMD ["nginx", "-g", "daemon off;"]
