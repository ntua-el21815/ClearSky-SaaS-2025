<<<<<<< HEAD
# Build stage
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing support
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
=======
# ----------- 1. BUILD STAGE -----------
FROM node:20-alpine AS build
WORKDIR /app

# Αντιγραφή dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Αντιγραφή υπόλοιπων αρχείων
COPY . .

# Build-time περιβάλλον (μόνο για Vite)
ARG VITE_USER_API_URL
ARG VITE_REVIEW_API_URL
ARG VITE_GRADE_API_URL

ENV VITE_USER_API_URL=${VITE_USER_API_URL} \
    VITE_REVIEW_API_URL=${VITE_REVIEW_API_URL} \
    VITE_GRADE_API_URL=${VITE_GRADE_API_URL}

# Δημιουργία build (στο /app/dist)
RUN npm run build


# ----------- 2. RUNTIME STAGE -----------
FROM nginx:alpine

# Αντιγραφή των built αρχείων στο σωστό path του NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Προσθήκη custom config για React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> origin/Harris
