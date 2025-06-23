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

ENV VITE_REVIEW_API_URL=http://localhost:8082 \
    VITE_USER_API_URL=http://localhost:8100 \
    VITE_GRADE_API_URL=http://localhost:8081

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
