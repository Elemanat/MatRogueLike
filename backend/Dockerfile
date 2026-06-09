# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Zkopírujeme definice závislostí a Prisma schéma
COPY package*.json ./
COPY prisma ./prisma

# Nainstalujeme ÚPLNĚ VŠECHNY závislosti (včetně devDependencies, abychom mohli kompilovat)
RUN npm ci

# Vygenerujeme Prisma klienta pro build fázi (aby TypeScript znal typy z databáze)
RUN npx prisma generate

# Zkopírujeme zdrojové kódy a konfiguraci TypeScriptu
COPY src ./src
COPY tsconfig.json ./

# Zkompilujeme TypeScript do čistého JavaScriptu (vytvoří složku dist)
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Nainstalujeme dumb-init (pro čisté vypínání Node.js) a netcat (pro tvůj entrypoint skript)
RUN apk add --no-cache dumb-init netcat-openbsd

# Zkopírujeme package.json pro produkční instalaci
COPY package*.json ./

# Nainstalujeme POUZE produkční závislosti (ušetříme stovky megabajtů místa)
RUN npm ci --omit=dev

# Zkopírujeme Prisma schéma a znovu vygenerujeme klienta
# Děláme to přímo v čistém prostředí, abychom se vyhnuli problémům s cestami
COPY prisma ./prisma
RUN npx prisma generate

# Zkopírujeme POUZE zkompilovaný JavaScript z první fáze (žádné zbytečné .ts soubory)
COPY --from=builder /app/dist ./dist

# Zkopírujeme a zprovozníme tvůj startovací skript
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Vystavíme port, na kterém poslouchá Express
EXPOSE 3001

# Healthcheck, aby Docker a Kubernetes poznaly, že server žije
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Používáme dumb-init pro správné zpracování signálů
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]

# Spuštění aplikace
CMD ["npm", "start"]
