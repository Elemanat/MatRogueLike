# Docker Setup Guide

## Quick Start

```bash
# Spusť PostgreSQL + Backend s jedním příkazem
docker-compose up --build

# Backend bude dostupný na http://localhost:3001
# PostgreSQL na localhost:5432 (user: postgres, password: postgres)
```

## Služby

### 1. PostgreSQL (postgres)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: matrogulike
- **User**: postgres / postgres
- **Volume**: `postgres_data` (persistent storage)
- **Healthcheck**: Automatic check every 10s

### 2. Backend (backend)
- **Build**: `backend/Dockerfile` (multi-stage build)
- **Port**: 3001
- **Env**: Automaticky načítá z docker-compose.yml
- **Healthcheck**: Kontroluje /api/health endpoint
- **Volumes**: Binding `backend/src` pro live reload v dev módu
- **Depends on**: PostgreSQL (čeká na spuštění)

## Příkazy

```bash
# Spusť vše
docker-compose up

# Background (detached mode)
docker-compose up -d

# Build bez spuštění
docker-compose build

# Zastavit služby
docker-compose down

# Zastavit + smazat volumes (POZOR: smaže DB!)
docker-compose down -v

# Logy
docker-compose logs -f
docker-compose logs -f postgres
docker-compose logs -f backend

# Spusť bash v kontejneru
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U postgres -d matrogulike
```

## Development Workflow

### Kód se auto-reloaduje
- Změny v `backend/src` jsou okamžitě vidět (volume binding)
- Backend běží pod `nodemon` (viz npm run dev)

### Zkusit databázi
```bash
docker-compose exec postgres psql -U postgres -d matrogulike

# K potom v psql:
\dt  # List tabulky
SELECT * FROM "Player";
SELECT * FROM "Run";
\q   # Quit
```

### Resetovat databázi
```bash
# Smaž volume a znovu vytvoř
docker-compose down -v
docker-compose up
```

## Troubleshooting

### "Port 5432 already in use"
```bash
# Najdi co používá port
lsof -i :5432
# Nebo změní port v docker-compose.yml: 5433:5432
```

### "Backend se nespouští / migrace selhávají"
```bash
docker-compose logs backend
# Zkontroluj /backend/docker-entrypoint.sh
```

### "Database migration failed"
```bash
# Resetuj databázi
docker-compose down -v
docker-compose up

# Nebo ručně spusť migraci
docker-compose exec backend npx prisma migrate deploy
```

### "Jak vidím data v databázi?"
```bash
docker-compose exec postgres psql -U postgres matrogulike

# Pak:
SELECT COUNT(*) FROM "Player";
SELECT COUNT(*) FROM "Run";
\d  # Show schema
```

## Production Deployment

### Build obraz
```bash
docker build -t matrogulike-backend:latest backend/
```

### Push na registry
```bash
docker tag matrogulike-backend:latest your-registry/matrogulike-backend:latest
docker push your-registry/matrogulike-backend:latest
```

### Spusť bez docker-compose (manuálně)
```bash
# PostgreSQL
docker run -d \
  --name matrogulike-postgres \
  -e POSTGRES_DB=matrogulike \
  -e POSTGRES_PASSWORD=securepassword \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Backend
docker run -d \
  --name matrogulike-backend \
  -e DATABASE_URL="postgresql://postgres:securepassword@matrogulike-postgres:5432/matrogulike" \
  -p 3001:3001 \
  --link matrogulike-postgres \
  matrogulike-backend:latest
```

## Bezpečnost (production)

⚠️ Předtím než deploješ do produkce:

- [ ] Změní výchozí heslo PostgreSQL
- [ ] Změní DATABASE_URL na bezpečné heslo
- [ ] Nastavit environment variables bezpečně
- [ ] Použít secrets manager (Docker Secrets, Kubernetes Secrets)
- [ ] Enable SSL pro PostgreSQL
- [ ] Zálohování databáze

## Persistence

PostgreSQL data se ukládá do Docker volume `postgres_data`.

```bash
# Podívej se na volumes
docker volume ls

# Inspect volume
docker volume inspect matrogulike_postgres_data

# Backup volume
docker run --rm -v matrogulike_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data
```

