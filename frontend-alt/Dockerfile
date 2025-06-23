
FROM nginx:alpine

# Copy the static files to nginx html directory
COPY . /usr/share/nginx/html

# Create a simple nginx config for serving static files
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Serve static files \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Optional: Add some basic security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]