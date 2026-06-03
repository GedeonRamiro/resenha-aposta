-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('LEAGUE_GROUP', 'KNOCKOUT');

-- CreateEnum
CREATE TYPE "TieStatus" AS ENUM ('OPEN', 'CLOSED', 'FINISHED');

-- CreateEnum
CREATE TYPE "TieDecisionType" AS ENUM ('AGGREGATE', 'PENALTIES');

-- CreateEnum
CREATE TYPE "WinnerSide" AS ENUM ('HOME', 'AWAY');

-- CreateEnum
CREATE TYPE "TieBetOption" AS ENUM ('HOME_ADVANCES', 'AWAY_ADVANCES');

-- CreateTable
CREATE TABLE "Tie" (
    "id" TEXT NOT NULL,
    "competition" TEXT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "legsCount" INTEGER NOT NULL DEFAULT 1,
    "status" "TieStatus" NOT NULL DEFAULT 'OPEN',
    "winnerSide" "WinnerSide",
    "decidedBy" "TieDecisionType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TieBet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tieId" TEXT NOT NULL,
    "option" "TieBetOption" NOT NULL,
    "isCorrect" BOOLEAN,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastEditedAt" TIMESTAMP(3),

    CONSTRAINT "TieBet_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Game"
ADD COLUMN "gameType" "GameType" NOT NULL DEFAULT 'LEAGUE_GROUP',
ADD COLUMN "tieId" TEXT,
ADD COLUMN "legNumber" INTEGER,
ADD COLUMN "penaltyHomeScore" INTEGER,
ADD COLUMN "penaltyAwayScore" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "TieBet_userId_tieId_key" ON "TieBet"("userId", "tieId");

-- CreateIndex
CREATE INDEX "TieBet_tieId_idx" ON "TieBet"("tieId");

-- CreateIndex
CREATE INDEX "TieBet_userId_idx" ON "TieBet"("userId");

-- CreateIndex
CREATE INDEX "TieBet_tieId_settledAt_idx" ON "TieBet"("tieId", "settledAt");

-- CreateIndex
CREATE INDEX "Game_tieId_idx" ON "Game"("tieId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_tieId_fkey" FOREIGN KEY ("tieId") REFERENCES "Tie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieBet" ADD CONSTRAINT "TieBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieBet" ADD CONSTRAINT "TieBet_tieId_fkey" FOREIGN KEY ("tieId") REFERENCES "Tie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
