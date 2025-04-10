FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on (for HTTP server if needed)
EXPOSE 3000

# Command to run the application is defined in smithery.yaml
CMD ["node", "stdio_server.js"]
