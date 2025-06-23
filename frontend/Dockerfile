# Build stage
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Αντιγραφή υπόλοιπων αρχείων
COPY . .

# Build-time περιβάλλον (μόνο για Vite)
ARG VITE_USER_API_URL
ARG VITE_REVIEW_API_URL
ARG VITE_GRADE_API_URL

ENV VITE_REVIEW_API_URL=http://localhost:8082 \
    VITE_USER_API_URL=http://localhost:8100 \
    VITE_GRADE_API_URL=http://localhost:8081

# Δημιουργία build (στο /app/dist)
RUN npm run build


# ----------- 2. RUNTIME STAGE -----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Fixed nginx config for SPA with proper asset handling
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Handle static assets first \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Handle assets directory \
    location /assets/ { \
        try_files $uri =404; \
    } \
    \
    # Handle all other requests (SPA routing) \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
