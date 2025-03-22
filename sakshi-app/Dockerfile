# Stage 1: Build the Angular application
FROM node:20.15.0-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create necessary directories and set permissions
RUN mkdir -p /tmp/nginx && \
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /etc/nginx/templates && \
    chown -R nginx:nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 755 /tmp/nginx && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /etc/nginx

# Create main nginx.conf file
RUN printf "pid /tmp/nginx.pid;\n\
worker_processes auto;\n\
error_log /dev/stderr warn;\n\
events {\n\
    worker_connections 1024;\n\
}\n\
http {\n\
    client_body_temp_path /var/cache/nginx/client_temp;\n\
    proxy_temp_path /var/cache/nginx/proxy_temp;\n\
    fastcgi_temp_path /var/cache/nginx/fastcgi_temp;\n\
    uwsgi_temp_path /var/cache/nginx/uwsgi_temp;\n\
    scgi_temp_path /var/cache/nginx/scgi_temp;\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    access_log /dev/stdout;\n\
    sendfile on;\n\
    keepalive_timeout 65;\n\
    include /etc/nginx/conf.d/*.conf;\n\
}" > /etc/nginx/nginx.conf

# Copy server configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built application
COPY --from=builder --chown=nginx:nginx /app/dist/sakshi-app /usr/share/nginx/html

# Environment variables
ENV PORT=8080
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
