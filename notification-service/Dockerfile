FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8500
# which function the container will start
CMD ["node", "index.js"]
