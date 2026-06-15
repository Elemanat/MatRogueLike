# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Zkopírujeme závislosti a nainstalujeme je
COPY package*.json ./
RUN npm ci

# Zkopírujeme zbytek kódu a sestavíme produkční verzi (Vite vytvoří složku dist)
COPY . .
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM nginx:alpine

# Zkopírujeme zkompilovaný kód z první fáze do webového serveru Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponujeme port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]