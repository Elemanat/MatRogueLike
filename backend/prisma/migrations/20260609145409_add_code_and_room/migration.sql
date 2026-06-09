-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Player" ("createdAt", "id", "name", "code") 
SELECT "createdAt", "id", "name", 
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  '-' ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1) ||
  substr('abcdefghijklmnopqrstuvwxyz0123456789', abs(random() % 36) + 1, 1)
FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_code_key" ON "Player"("code");
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
CREATE TABLE "new_Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "floor" INTEGER NOT NULL DEFAULT 1,
    "room" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    "currentProblemId" TEXT,
    "currentProblemAnswers" TEXT,
    "hp" INTEGER NOT NULL DEFAULT 3,
    "maxHp" INTEGER NOT NULL DEFAULT 3,
    "items" TEXT DEFAULT '[]',
    "seed" TEXT,
    CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Run" ("currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "hp", "id", "items", "maxHp", "playerId", "score", "seed", "startedAt", "status", "towerId", "room") SELECT "currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "hp", "id", "items", "maxHp", "playerId", "score", "seed", "startedAt", "status", "towerId", 1 FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
