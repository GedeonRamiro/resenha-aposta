-- AlterTable
ALTER TABLE "Config"
ADD COLUMN "rankingSeasons" JSONB NOT NULL DEFAULT '[]';
