-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_name_key" ON "Competition"("name");

-- AlterTable
ALTER TABLE "Game"
ADD COLUMN "homeTeamId" TEXT,
ADD COLUMN "awayTeamId" TEXT,
ADD COLUMN "competitionId" TEXT;

-- AlterTable
ALTER TABLE "Tie"
ADD COLUMN "competitionId" TEXT,
ADD COLUMN "homeTeamId" TEXT,
ADD COLUMN "awayTeamId" TEXT;

-- Backfill teams from existing games/ties
INSERT INTO "Team" ("id", "name", "logoUrl", "createdAt", "updatedAt")
SELECT
  md5(src."name" || clock_timestamp()::text || random()::text),
  src."name",
  src."logoUrl",
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT "homeTeam" AS "name", "homeTeamLogo" AS "logoUrl"
  FROM "Game"
  WHERE "homeTeam" IS NOT NULL AND "homeTeam" <> ''

  UNION

  SELECT DISTINCT "awayTeam" AS "name", "awayTeamLogo" AS "logoUrl"
  FROM "Game"
  WHERE "awayTeam" IS NOT NULL AND "awayTeam" <> ''

  UNION

  SELECT DISTINCT "homeTeam" AS "name", NULL::text AS "logoUrl"
  FROM "Tie"
  WHERE "homeTeam" IS NOT NULL AND "homeTeam" <> ''

  UNION

  SELECT DISTINCT "awayTeam" AS "name", NULL::text AS "logoUrl"
  FROM "Tie"
  WHERE "awayTeam" IS NOT NULL AND "awayTeam" <> ''
) src
ON CONFLICT ("name") DO NOTHING;

-- Backfill competitions from existing games/ties
INSERT INTO "Competition" ("id", "name", "logoUrl", "createdAt", "updatedAt")
SELECT
  md5(src."name" || clock_timestamp()::text || random()::text),
  src."name",
  NULL,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT "competition" AS "name"
  FROM "Game"
  WHERE "competition" IS NOT NULL AND "competition" <> ''

  UNION

  SELECT DISTINCT "competition" AS "name"
  FROM "Tie"
  WHERE "competition" IS NOT NULL AND "competition" <> ''
) src
ON CONFLICT ("name") DO NOTHING;

-- Backfill Game foreign keys
UPDATE "Game" g
SET "homeTeamId" = t."id"
FROM "Team" t
WHERE g."homeTeam" = t."name" AND g."homeTeamId" IS NULL;

UPDATE "Game" g
SET "awayTeamId" = t."id"
FROM "Team" t
WHERE g."awayTeam" = t."name" AND g."awayTeamId" IS NULL;

UPDATE "Game" g
SET "competitionId" = c."id"
FROM "Competition" c
WHERE g."competition" = c."name" AND g."competitionId" IS NULL;

-- Backfill Tie foreign keys
UPDATE "Tie" t0
SET "homeTeamId" = t."id"
FROM "Team" t
WHERE t0."homeTeam" = t."name" AND t0."homeTeamId" IS NULL;

UPDATE "Tie" t0
SET "awayTeamId" = t."id"
FROM "Team" t
WHERE t0."awayTeam" = t."name" AND t0."awayTeamId" IS NULL;

UPDATE "Tie" t0
SET "competitionId" = c."id"
FROM "Competition" c
WHERE t0."competition" = c."name" AND t0."competitionId" IS NULL;

-- Indexes
CREATE INDEX "Game_homeTeamId_idx" ON "Game"("homeTeamId");
CREATE INDEX "Game_awayTeamId_idx" ON "Game"("awayTeamId");
CREATE INDEX "Game_competitionId_idx" ON "Game"("competitionId");

CREATE INDEX "Tie_competitionId_idx" ON "Tie"("competitionId");
CREATE INDEX "Tie_homeTeamId_idx" ON "Tie"("homeTeamId");
CREATE INDEX "Tie_awayTeamId_idx" ON "Tie"("awayTeamId");

-- Foreign keys
ALTER TABLE "Game"
ADD CONSTRAINT "Game_homeTeamId_fkey"
FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Game"
ADD CONSTRAINT "Game_awayTeamId_fkey"
FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Game"
ADD CONSTRAINT "Game_competitionId_fkey"
FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Tie"
ADD CONSTRAINT "Tie_competitionId_fkey"
FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Tie"
ADD CONSTRAINT "Tie_homeTeamId_fkey"
FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Tie"
ADD CONSTRAINT "Tie_awayTeamId_fkey"
FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
