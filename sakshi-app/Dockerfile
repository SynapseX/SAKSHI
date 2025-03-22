# Stage 1: Build the Angular application
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the Angular application for production
RUN yarn run build

# RUN ls -l /app/client/dist

# Stage 2: Serve the built application with nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=build /app/dist/sakshi-app/browser /usr/share/nginx/html

# Expose port 80 (default nginx port)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
