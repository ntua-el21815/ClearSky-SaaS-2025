# === 1) Base image ===
FROM node:18-alpine

# === 2) Working directory μέσα στο container ===
WORKDIR /usr/src/app

# === 3) Αντιγραφή package files & εγκατάσταση dependencies ===
COPY package.json package-lock.json ./
RUN npm install --production

# === 4) (Προαιρετικό) Αν θες να περάσεις μέσα τα env vars ===
# COPY .env ./

# === 5) Αντιγραφή του υπόλοιπου κώδικα ===
COPY . .

# === 6) Δήλωση port ===
EXPOSE 5000

# === 7) Εντολή εκκίνησης ===
CMD ["sh", "-c", "node server.js & node consumer.js"]
