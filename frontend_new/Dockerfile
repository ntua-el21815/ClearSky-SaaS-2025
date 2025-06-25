FROM nginx:alpine

# Αντιγραφή custom config (για να σερβίρει index.html κ.ά.)
COPY default.conf /etc/nginx/conf.d/default.conf

# Αντιγραφή όλων των HTML/JS/CSS στον κατάλογο που σερβίρει το nginx
COPY . /usr/share/nginx/html

EXPOSE 80