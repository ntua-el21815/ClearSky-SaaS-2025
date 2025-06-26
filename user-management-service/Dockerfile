FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001

# Install concurrently to run both app and consumer together
RUN npm install -g concurrently

CMD ["concurrently", "node app.js", "node courseConsumer.js"]
