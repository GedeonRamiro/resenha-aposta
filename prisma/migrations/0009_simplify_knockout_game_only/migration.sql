-- Remove Game -> Tie relationship and legacy knockout helper column
ALTER TABLE "Game" DROP CONSTRAINT IF EXISTS "Game_tieId_fkey";

DROP INDEX IF EXISTS "Game_tieId_idx";
DROP INDEX IF EXISTS "Game_isKnockout_idx";

ALTER TABLE "Game"
DROP COLUMN IF EXISTS "tieId",
DROP COLUMN IF EXISTS "isKnockout";

-- Remove parallel tie domain
DROP TABLE IF EXISTS "TieBet";
DROP TABLE IF EXISTS "Tie";

-- Remove enums from removed tie domain
DROP TYPE IF EXISTS "TieBetOption";
DROP TYPE IF EXISTS "WinnerSide";
DROP TYPE IF EXISTS "TieDecisionType";
DROP TYPE IF EXISTS "TieStatus";
