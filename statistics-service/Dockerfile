<<<<<<< HEAD
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8300

CMD ["node", "server.js"]
=======
# Use a small, modern Node image
FROM node:20-alpine

# Create working directory
WORKDIR /usr/src/app

# Install dependencies first (better layer-caching)
COPY package*.json ./
RUN npm ci --omit=dev   # install only production deps

# Copy the rest of the source code
COPY . .

# Optional: expose the API port (adjust if you run server.js too)
EXPOSE 3002

# Default: start ONLY the RabbitMQ consumer
CMD ["node", "src/consumer.js"]
>>>>>>> origin/lia
