FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8101

RUN npm install -g concurrently

CMD ["concurrently", "node server.js", "node consumer.js"]
