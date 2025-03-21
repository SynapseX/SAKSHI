# Stage 1: Build the Angular frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/sakshi-app

COPY sakshi-app/package*.json ./
RUN npm install

COPY sakshi-app/. ./

RUN npm run build

# Stage 2: Build the Python backend
FROM python:3.9-slim-buster AS backend-builder

WORKDIR /app/backend/app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/. .

# Stage 3: Combine frontend and backend into a single image
FROM python:3.9-slim-buster

# Install nginx
RUN apt-get update && apt-get install -y nginx

# Copy the built Angular app
COPY --from=frontend-builder /app/sakshi-app/dist/sakshi-app /usr/share/nginx/html

# Copy the Python backend
COPY --from=backend-builder /app/backend/app /app/backend/app

# Install backend requirements in final stage.
COPY backend/requirements.txt /app/backend/app/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/app/requirements.txt

# Copy a startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the Nginx port
EXPOSE 80

# Start Nginx and the backend
CMD ["/startup.sh"]