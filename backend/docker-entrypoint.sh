#!/bin/sh
# Entrypoint script pro backend kontejner
# Vždy spustí migrace, pak podle NODE_ENV spustí dev server nebo produkční aplikaci

set -e

echo "🚀 Spouštění MatRogueLike backend..."
echo "📊 NODE_ENV: ${NODE_ENV:-development}"

# Vždy čekej na PostgreSQL
echo "⏳ Čekám na PostgreSQL..."
for i in $(seq 1 30); do
  if nc -z postgres 5432 2>/dev/null; then
    echo "✅ PostgreSQL je připravena"
    break
  fi
  echo "⏳ Pokus $i/30..."
  sleep 1
done

# Vždy spusť migrace (dev i prod)
echo "📦 Aplikuji Prisma migrace..."
npx prisma migrate deploy

echo "✅ Migrace hotové"
echo "🎮 Spouštím backend..."

# V development módu - spusť dev server s hot reload
if [ "$NODE_ENV" = "development" ]; then
  echo "🔧 Development mode - hot reload..."
  exec npx tsx watch src/index.ts
fi

# V production módu - spusť aplikaci
exec npm start