# Base image
FROM node:20-alpine

# Set workdir
WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install prod deps only
RUN npm install --omit=dev

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Run app
CMD ["npm", "run", "prod"]