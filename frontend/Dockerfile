# Use an official node runtime as a parent image
FROM node:14 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Specify the argument for the build-time environment variable
ARG REACT_APP_BACKEND_URL

# Set the environment variable so it's available to the build script
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copy the rest of the application code into the container
COPY . .

# Build the Vite app
RUN npm run build


# Use an official nginx image as the base image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]