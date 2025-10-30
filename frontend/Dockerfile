# --- Stage 1: Build the React App ---
# Use the official Node.js image to build our app
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend code and run the build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
# Use a lightweight Nginx image to serve the built files
FROM nginx:stable-alpine

# Copy the built static files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your custom Nginx config
# This file tells Nginx how to handle API requests and React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx's default port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

