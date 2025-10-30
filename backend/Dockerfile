# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
# This caches our dependencies for faster rebuilds
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# The command to start your server in production
CMD ["node", "server.js"]

