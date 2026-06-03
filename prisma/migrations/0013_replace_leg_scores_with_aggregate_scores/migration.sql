ALTER TABLE "Game"
ADD COLUMN IF NOT EXISTS "aggregateHomeScore" INTEGER,
ADD COLUMN IF NOT EXISTS "aggregateAwayScore" INTEGER;

UPDATE "Game"
SET
  "aggregateHomeScore" = COALESCE(
    (SELECT SUM(value) FROM UNNEST("homeScores") AS value),
    "homeScore"
  ),
  "aggregateAwayScore" = COALESCE(
    (SELECT SUM(value) FROM UNNEST("awayScores") AS value),
    "awayScore"
  )
WHERE "aggregateHomeScore" IS NULL
   OR "aggregateAwayScore" IS NULL;

ALTER TABLE "Game"
DROP COLUMN IF EXISTS "homeScores",
DROP COLUMN IF EXISTS "awayScores";
