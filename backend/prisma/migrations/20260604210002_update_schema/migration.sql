-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnswerLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "playerAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AnswerLog" ("createdAt", "id", "isCorrect", "playerAnswer", "problemId", "runId", "topic") SELECT "createdAt", "id", "isCorrect", "playerAnswer", "problemId", "runId", "topic" FROM "AnswerLog";
DROP TABLE "AnswerLog";
ALTER TABLE "new_AnswerLog" RENAME TO "AnswerLog";
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
    CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Run" ("currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "hp", "id", "items", "maxHp", "playerId", "score", "seed", "startedAt", "status", "towerId") SELECT "currentProblemAnswers", "currentProblemId", "finishedAt", "floor", "hp", "id", "items", "maxHp", "playerId", "score", "seed", "startedAt", "status", "towerId" FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
