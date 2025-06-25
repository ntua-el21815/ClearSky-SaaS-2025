FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5002

# Install concurrently to run both the API and the consumer
RUN npm install -g concurrently

CMD ["concurrently", "node app.js", "node consumer/consumer.js"]