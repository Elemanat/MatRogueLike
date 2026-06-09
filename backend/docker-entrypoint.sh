#!/bin/sh
# Entrypoint script pro backend kontejner
# V dev módu: spustí npm run dev
# V prod módu: spustí migrace, pak npm start

set -e

echo "🚀 Spouštění MatRogueLike backend..."
echo "📊 NODE_ENV: ${NODE_ENV:-development}"

# V development módu - jen spusť dev server
if [ "$NODE_ENV" = "development" ]; then
  echo "🔧 Development mode - spuštění dev serveru s hot reload..."
  exec npm run dev
fi

# V production módu - spusť migrace
echo "⏳ Production mode - čekám na PostgreSQL..."
if command -v wait-for-it >/dev/null 2>&1; then
  wait-for-it db:5432 -t 30
else
  # Fallback - jednoduché čekání
  for i in $(seq 1 30); do
    if nc -z db 5432 2>/dev/null; then
      echo "✅ PostgreSQL je připravena"
      break
    fi
    echo "⏳ Pokus $i/30..."
    sleep 1
  done
fi

# Aplikuj migrace
echo "📦 Aplikuji Prisma migrace..."
npx prisma migrate deploy

echo "✅ Migrace hotové"
echo "🎮 Spouštím backend..."

# Spusť aplikaci
exec npm start

