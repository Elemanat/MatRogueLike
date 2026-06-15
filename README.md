# 🎮 VezMat (MatRogueLike)

**Roguelike matematická hra pro žáky 6. třídy.** Učte se matematiku prostřednictvím poutavé dungeon crawler hry.

---

## 📋 Obsah

- [Jak spustit](#-jak-spustit)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Funkce](#-funkce)
- [Jak to funguje](#-jak-to-funguje)
- [Struktura projektu](#-struktura-projektu)
- [Vývoj](#%EF%B8%8F-vývoj)
- [Deployment](#-deployment)
- [Plán vývoje](#%EF%B8%8F-plán-vývoje)

---

## 🚀 Jak spustit

**Terminal 1: Backend + Databáze**

```powershell
docker-compose up --build
```

**Terminal 2: Frontend**

```powershell
npm install
npm run dev
```

Otevři aplikaci v prohlížeči:
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:3001/
- **Databáze**: localhost:5432

Vypnutí: `Ctrl+C` v obou terminálech (nebo `docker-compose down` v prvním terminálu)

---

## 🛠️ Tech Stack

### Frontend
| Technologie | Účel |
|-----------|---------|
| **React 19** | UI komponenty & správa stavu |
| **TypeScript** | Typová bezpečnost |
| **Vite** | Bleskurychlý build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Knihovna ikon |

### Backend
| Technologie | Účel |
|-----------|---------|
| **Node.js 20** | Runtime prostředí |
| **Express.js** | REST API framework |
| **TypeScript** | Typová bezpečnost |
| **Prisma ORM** | Typově bezpečný přístup do DB |
| **Nodemon** | Auto-reload během vývoje |

### Databáze & Infrastruktura
| Technologie | Účel |
|-----------|---------|
| **PostgreSQL 16** | Relační databáze |
| **Docker** | Kontejnerizace |
| **Docker Compose** | Lokální orchestrace |
| **Nginx** | Web server pro frontend |
| **Kubernetes** | (Plánováno) Produkční orchestrace |

### Vývoj & Kvalita
| Nástroj | Účel |
|------|---------|
| **ESLint** | Code linting |
| **TypeScript Compiler** | Typová kontrola |
| **Markdown-pdf** | Generování dokumentace |

---

## ✨ Funkce

- 🎮 **Přihlašovací systém** - Zadání jména hráče a správa relace
- 🏰 **Výběr věže** - Zvolte si cestu hry (2 věže dostupné)
- 🗺️ **Procedurální herní smyčka** - Místnosti → Boj/Truhla/Prázdno → Miniboss → Boss
- ⚔️ **Systém boje**
  - Real-time časovač s vizuální zpětnou vazbou
  - Výběr odpovědí s okamžitou zpětnou vazbou
  - Sledování HP nepřítele a zobrazení poškození
  - Používání předmětů během boje
- 🧮 **Inteligentní validace odpovědí** - Kontrola ekvivalence zlomků (např. `1/2` = `2/4`)
- 💎 **Systém odměn** - Otevírání truh a sběr předmětů
- 🎨 **HUD prvky**
  - Minimapu pro navigaci
  - Zdravotní lišta a stavové ukazatele
- 📊 **Sledování statistik**
  - Statistiky za běh (`runStats`)
  - Statistiky za relaci (`sessionStats`)
  - Sledování úspěchů
- ⚙️ **Přizpůsobitelná nastavení**
  - Úprava délky časovače
  - Vypnutí zvuku
  - Volba pohybu se sníženým pohybem
  - Lokální persistence

---

## 🎮 Jak to funguje

### Herní tok
1. **Přihlášení** → Zadej jméno hráče
2. **Výběr věže** → Zvol obtížnost/motiv
3. **Herní smyčka** (opakuje se na každém patře):
   - Vstup do **místnosti** (boj, truhla nebo prázdné setkání)
   - Vyřešení **matematické úlohy** s časovačem
   - Boj: poraz nepřítele správným zodpovězením otázek
   - Truhla: sesbírání odměn/předmětů
   - Prázdno: postup na další místnost
4. **Boj s minibossem** → Těžší úloha
5. **Boj s bossem** → Finální výzva
6. **Konec relace** → Zobrazení statistik

### Přehled architektury

```
┌─────────────────────────────────────────────────────────────┐
│                      Prohlížeč (Frontend)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React komponenty (Vrstva UI)                           │ │
│  │  - LoginScreen, TowerSelect, CombatScreen, atd.         │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  useGameState Hook (Správa stavu)                       │ │
│  │  - Spravuje GameState přes useReducer                   │ │
│  │  - Ukládá do localStorage                               │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  API klient (Mock nebo Real)                            │ │
│  │  - Generování/načítání úloh                             │ │
│  │  - Historie běhů (v budoucnu)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────┘
                      │ (HTTP)
         ┌────────────▼──────────────┐
         │   Backend (Express.js)    │
         │  ┌──────────────────────┐ │
         │  │ API Routes           │ │
         │  │ /api/runs/*          │ │
         │  │ /api/problems/*      │ │
         │  │ /api/players/*       │ │
         │  └────────┬─────────────┘ │
         │           │               │
         │  ┌────────▼─────────────┐ │
         │  │ Prisma ORM           │ │
         │  │ (Typově bezpečné)    │ │
         │  └────────┬─────────────┘ │
         └───────────┬────────────────┘
                     │
         ┌───────────▼──────────────┐
         │  PostgreSQL Databáze     │
         │  - Hráči                 │
         │  - Běhy                  │
         │  - Úlohy                 │
         │  - Statistika            │
         └──────────────────────────┘
```

### Správa stavu
- **Frontend State** se uchovává v `useGameState` hooku (Redux-like pattern)
- **Persistence** přes `localStorage` (funguje offline)
- **Backend State** uložený v PostgreSQL (běhy, profily hráčů, historie)

---

## 📁 Struktura projektu

### Frontend (`/src`)
```
src/
├── types/
│   └── game.ts              # Core doménové typy (GameState, PlayerStats, Problem, Item)
├── hooks/
│   └── useGameState.ts      # Centrální game reducer & správa stavu
├── services/
│   └── api/                 # Abstrakce API klienta (mock & real adaptery)
├── components/
│   ├── CombatScreen.tsx     # UI boje, časovač, zpracování odpovědí
│   └── [ostatní UI komponenty]
├── screens/
│   └── SettingsScreen.tsx   # Nastavení a preference hráče
├── App.tsx                  # Root komponenta
└── index.css               # Globální styly
```

### Backend (`/backend/src`)
```
backend/
├── index.ts                 # Nastavení Express serveru
├── routes/                  # API endpointy
├── services/                # Business logika
├── prisma/
│   └── schema.prisma        # Schéma databáze
└── [ostatní backend moduly]
```

---

## 🛠️ Vývoj

### Dostupné skripty

```powershell
# Frontend
npm run dev         # Spusť dev server
npm run build       # Vybuduj pro produkci
npm run lint        # Spusť ESLint
npm run preview     # Náhled produkční verze

# Backend (z /backend)
npm run dev         # Start s hot reload (nodemon)
npm run build       # Zkompiluj TypeScript
npm run start       # Spusť zkompilovanou aplikaci
```

### Kontrola kvality kódu

```powershell
# Linting všeho kódu
npm run lint

# Typová kontrola + build
npm run build
```

### Nastavení databáze (Backend)

```powershell
cd backend
npx prisma migrate dev    # Spusť migrace
npx prisma studio        # Otevři Prisma Studio GUI
```

---

## 🐳 Deployment

### Docker Compose (Vývoj)

```powershell
docker-compose up --build
```

Služby:
- **Frontend** (Nginx): http://localhost:5173
- **Backend** (Node.js): http://localhost:3001
- **Databáze** (PostgreSQL): localhost:5432

### Docker Images

**Frontend** - Multi-stage build optimalizovaný pro produkci
```dockerfile
# Build stage: Node.js 20-alpine
# Runtime stage: Nginx-alpine (minimální ~200MB)
```

**Backend** - Běží v Node.js kontejneru s hot reload během vývoje

### Kubernetes (Plánováno)

Připravované manifesty pro produkční deployment:
- Deployments (frontend, backend)
- Services (LoadBalancer/ClusterIP)
- Ingress pro routing
- ConfigMaps pro konfiguraci
- PersistentVolumes pro databázi

Viz `deploy.yaml` a `frontend-deploy.yaml` pro počáteční manifesty.

---

## 🗺️ Plán vývoje

### Fáze 1: Integrace backendu ✅ (Probíhá)
- [ ] REST API pro běhy a úlohy
- [ ] Endpointy profilu hráče
- [ ] Ukládání historie běhů a statistik
- [ ] Prisma schéma & migrace

**Plánované API endpointy:**
```
POST   /api/runs/start                    # Zahájit běh
POST   /api/runs/{id}/answer              # Odeslat odpověď
POST   /api/runs/{id}/finish              # Ukončit běh
GET    /api/problems/next?topic=X&diff=Y  # Načíst další úlohu
GET    /api/players/{id}/stats            # Statistiky hráče
```

### Fáze 2: Produkční deployment
- [ ] Kubernetes manifesty (Deployment, Service, Ingress)
- [ ] Helm chart pro snazší deployment
- [ ] ConfigMap pro správu prostředí
- [ ] Strategie zálohování databáze

### Fáze 3: Engine pro generování úloh
- [ ] Deterministické šablony úloh (zlomky, desetinná čísla, násobení)
- [ ] Úrovně obtížnosti podle patra
- [ ] Utility pro kanonizaci odpovědí
- [ ] Randomizace úloh s podporou seed

### Fáze 4: Vizuální vylepšení
- [ ] Ručně kreslené pozadí
- [ ] Sprite postavy (čaroděj, nepřátelé)
- [ ] Ikony předmětů
- [ ] Značky místností & vylepšení UI

### Fáze 5: Funkce & obsah
- [ ] Žebříček leaderboard
- [ ] Systém úspěchů
- [ ] Více motivů věží
- [ ] Multiplayer prvky (volitelně)

---

## 🤝 Přispívání

1. Vytvoř feature branch (`git checkout -b feature/nazev-funkce`)
2. Proveď změny
3. Spusť linting: `npm run lint`
4. Spusť build: `npm run build`
5. Commituj s popisným zprávou
6. Push a vytvoř Pull Request

---

**Zábavu a úspěchy v učení!** 🎮✨
