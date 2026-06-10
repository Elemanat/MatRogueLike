-- CreateTable
CREATE TABLE "AnswerLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "playerAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "floor" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    "currentProblemId" TEXT,
    "currentProblemAnswers" TEXT,
    "hp" INTEGER NOT NULL DEFAULT 3,
    "maxHp" INTEGER NOT NULL DEFAULT 3,
    "items" TEXT DEFAULT '[]',
    "seed" TEXT,
    CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Run" ("currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "id", "playerId", "score", "startedAt", "status", "towerId") SELECT "currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "id", "playerId", "score", "startedAt", "status", "towerId" FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
