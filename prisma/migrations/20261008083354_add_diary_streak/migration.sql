-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'GLOBAL',
    "dietPattern" TEXT NOT NULL DEFAULT 'MIXED',
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "primaryTransport" TEXT NOT NULL DEFAULT 'CAR_PETROL',
    "targetReductionPct" REAL NOT NULL DEFAULT 20.0,
    "monthlyBudget" REAL NOT NULL DEFAULT 2000.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastDiaryLogDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("createdAt", "currency", "dietPattern", "householdSize", "id", "monthlyBudget", "onboardingComplete", "primaryTransport", "region", "targetReductionPct", "updatedAt", "userId") SELECT "createdAt", "currency", "dietPattern", "householdSize", "id", "monthlyBudget", "onboardingComplete", "primaryTransport", "region", "targetReductionPct", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
