-- CreateEnum
CREATE TYPE "KnockoutFormat" AS ENUM ('SINGLE_LEG', 'TWO_LEGS');

-- AlterTable
ALTER TABLE "Game"
ADD COLUMN "knockoutFormat" "KnockoutFormat" NOT NULL DEFAULT 'SINGLE_LEG';

-- Backfill format for existing two-leg records
UPDATE "Game"
SET "knockoutFormat" = 'TWO_LEGS'
WHERE "gameType" = 'KNOCKOUT'
  AND "legNumber" IN (1, 2);

-- Drop old stage artifacts
DROP INDEX IF EXISTS "Game_stage_idx";

ALTER TABLE "Game"
DROP COLUMN IF EXISTS "stage";

DROP TYPE IF EXISTS "KnockoutStage";

-- New index
CREATE INDEX "Game_knockoutFormat_idx" ON "Game"("knockoutFormat");
