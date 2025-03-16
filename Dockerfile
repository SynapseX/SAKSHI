FROM node:18 AS build-angular
WORKDIR /app/sakshi-app
COPY sakshi-app/package.json sakshi-app/yarn.lock ./
RUN yarn install
COPY sakshi-app/ .
RUN yarn build

# Build FastAPI Backend
FROM python:3.11 AS build-fastapi
WORKDIR /app/backend
COPY backend/ .
RUN pip install --no-cache-dir -r requirements.txt

# Create final container with nginx
FROM nginx:alpine

# Copy Angular build to nginx html directory
COPY --from=build-angular /app/sakshi-app/dist/your-angular-app /usr/share/nginx/html

# Copy FastAPI app
COPY --from=build-fastapi /app/backend /app/backend

# Expose necessary ports
EXPOSE 80

# Start FastAPI and nginx
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 & nginx -g 'daemon off;'"]