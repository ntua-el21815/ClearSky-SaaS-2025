FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

<<<<<<< HEAD
EXPOSE 8300

CMD ["node", "src/consumer.js"]
=======
# Install concurrently to run both the API and the consumer
RUN npm install -g concurrently

CMD ["concurrently", "node server.js", "node src/consumer.js"]
>>>>>>> origin/lia
