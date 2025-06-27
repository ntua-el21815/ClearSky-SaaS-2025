FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency metadata first (for better Docker caching)
COPY package*.json ./

# Install dependencies (includes googleapis if in package.json)
RUN npm install

# Optional: explicitly install googleapis if not in package.json
# RUN npm install googleapis

# Copy the rest of your app source
COPY . .

# Expose the port used by your service
EXPOSE 8100

# Start the service
CMD ["node", "index.js"]
