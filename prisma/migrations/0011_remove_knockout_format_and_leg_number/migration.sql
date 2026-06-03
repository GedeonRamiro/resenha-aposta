DROP INDEX IF EXISTS "Game_knockoutFormat_idx";

ALTER TABLE "Game"
DROP COLUMN IF EXISTS "knockoutFormat",
DROP COLUMN IF EXISTS "legNumber";

DROP TYPE IF EXISTS "KnockoutFormat";
