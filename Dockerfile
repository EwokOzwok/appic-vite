# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or pnpm-lock.yaml/yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the production app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
