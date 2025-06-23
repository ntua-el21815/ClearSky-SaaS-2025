FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8300

# Install concurrently to run both the API and the consumer
RUN npm install -g concurrently

CMD ["concurrently", "node server.js", "node src/consumer.js"]
