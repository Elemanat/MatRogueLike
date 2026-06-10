-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "floor" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
