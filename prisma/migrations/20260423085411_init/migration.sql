-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh-TW',
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Elder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "avatarUrl" TEXT,
    "notes" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Taipei',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Elder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CAREGIVER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyMember_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CAREGIVER',
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyInvite_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameZh" TEXT,
    "dose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "purpose" TEXT,
    "startedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedOn" DATETIME,
    "photoUrl" TEXT,
    "notes" TEXT,
    "addedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medication_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Medication_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "loggedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vital_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vital_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "medIds" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "summaryZh" TEXT,
    "details" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interaction_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "summaryZh" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elderId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "Elder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_elderId_userId_key" ON "FamilyMember"("elderId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvite_token_key" ON "FamilyInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Insight_elderId_date_key" ON "Insight"("elderId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
