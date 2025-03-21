# Use an official Node.js runtime as a base image
FROM node:19-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the application source code
COPY . .

# Build the application
RUN yarn run build

# Use Nginx as a web server
FROM nginx:latest

# Copy the built application to the Nginx webroot
COPY --from=builder /app/dist/my-angular-app /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
