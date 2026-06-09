# Backend Setup - PostgreSQL + Docker

## Požadavky
- Docker a Docker Compose
- Node.js 20+
- psql CLI (optional, pro přímý přístup k databázi)

## Development Setup

### Možnost 1: S Docker Compose (doporučeno)

```bash
# Spusť PostgreSQL + Backend
docker-compose up --build

# Backend bude dostupný na http://localhost:3001
# PostgreSQL na localhost:5432
```

### Možnost 2: Lokální PostgreSQL

1. **Nainstaluj PostgreSQL 16+**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16

   # Windows - stáhni z https://www.postgresql.org/download/windows/
   # Linux - std. package manager
   ```

2. **Vytvoř databázi a uživatele:**
   ```bash
   psql postgres
   CREATE DATABASE matrogulike;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE matrogulike TO postgres;
   \q
   ```

3. **Spusť migraci:**
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   ```

4. **Spusť backend:**
   ```bash
   npm run dev
   ```

## Environment Variables

Vytvoř `.env` v `backend/` (viz `.env.example`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/matrogulike"
PORT=3001
NODE_ENV=development
```

## Prisma Commands

```bash
# Vytvoř novou migraci (když změníš schema.prisma)
npx prisma migrate dev --name descriptive_name

# Aplikuj migraci na existující DB
npx prisma migrate deploy

# Reset DB (smaže všechna data!)
npx prisma migrate reset

# Vygeneruj Prisma client
npx prisma generate

# Otevři Prisma Studio (GUI pro DB)
npx prisma studio
```

## Produkční Deploy

Při deployu do produkce (Docker/Kubernetes):

```bash
# Migraci se spustí automaticky
npx prisma migrate deploy

# Spusť aplikaci
npm start
```

## Troubleshooting

### "database "matrogulike" does not exist"
```bash
createdb matrogulike
```

### Connection refused
```bash
# Zkontroluj, že PostgreSQL běží
psql -l  # měl by vypsat seznam databází

# Nebo v Dockeru
docker-compose ps  # zkontroluj status kontejnerů
docker-compose logs postgres  # zkontroluj logy
```

### Chceš resetovat databázi?
```bash
npx prisma migrate reset
```
⚠️ **POZOR**: Toto smaže všechna data!

