# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json from the correct directory
COPY ./apps/backend/package*.json ./

# Install global dependencies (including NestJS CLI)
RUN npm install -g @nestjs/cli

# Install the app dependencies
RUN npm install

# Copy the rest of the backend application code
COPY ./apps/backend ./

# Build the application using NestJS
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

CMD ["npm", "run", "dev"]
