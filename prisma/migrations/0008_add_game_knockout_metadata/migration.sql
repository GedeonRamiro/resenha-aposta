-- CreateEnum
CREATE TYPE "KnockoutStage" AS ENUM (
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
  'THIRD_PLACE',
  'OTHER'
);

-- AlterTable
ALTER TABLE "Game"
ADD COLUMN "isKnockout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stage" "KnockoutStage";

-- CreateIndex
CREATE INDEX "Game_isKnockout_idx" ON "Game"("isKnockout");

-- CreateIndex
CREATE INDEX "Game_stage_idx" ON "Game"("stage");
