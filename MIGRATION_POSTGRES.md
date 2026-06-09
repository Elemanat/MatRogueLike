# Migrace: SQLite → PostgreSQL

## Co se změnilo?

### 1. **Prisma Schema**
```prisma
// Bylo:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Teď je:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. **Environment**
```bash
# Bylo:
DATABASE_URL="file:./dev.db"

# Teď je:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/matrogulike"
```

### 3. **Docker**
- `docker-compose.yml` - PostgreSQL + Backend
- `backend/Dockerfile` - Kontejnerizace backendu
- `.dockerignore` - Optimalizace obrazu

## Jak spustit?

### Lokálně bez Dockeru
```bash
# 1. Nainstaluj PostgreSQL
# 2. Vytvoř databázi
createdb matrogulike

# 3. Aplikuj migraci
cd backend
npm install
npx prisma migrate deploy

# 4. Spusť backend
npm run dev
```

### S Dockerem (doporučeno)
```bash
docker-compose up --build
```

## Důležité poznámky

- ✅ **Staré migrace zůstávají** v `prisma/migrations/` as historical reference
- ✅ **Data nejsou importována** z SQLite (dev.db se už nepoužívá)
- ✅ **Migrace jsou verzovány** - każda změna schématu je v samostatném adresáři
- ⚠️ **SQLite soubory se ignorují** v `.dockerignore`

## Backup a restore

### Backup PostgreSQL
```bash
docker-compose exec postgres pg_dump -U postgres matrogulike > backup.sql
```

### Restore PostgreSQL
```bash
docker-compose exec -T postgres psql -U postgres matrogulike < backup.sql
```

## Performance tips

- PostgreSQL je výrazně rychlejší než SQLite na produktion
- Indexy se vytváří automaticky via Prisma
- Connection pooling je zahrnuto v backendu (viz express setup)

