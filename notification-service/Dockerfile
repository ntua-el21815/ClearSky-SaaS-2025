FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

<<<<<<< HEAD
EXPOSE 8500
# which function the container will start
CMD ["node", "index.js"]
=======
EXPOSE 8081

CMD ["node", "app.js"]
>>>>>>> origin/lia
