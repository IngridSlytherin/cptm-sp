CREATE TYPE "OperationalStatus" AS ENUM ('NORMAL', 'REDUCED_SPEED', 'PARTIAL_OPERATION', 'INTERRUPTED', 'CLOSED', 'PLANNED_MAINTENANCE', 'UNKNOWN');

ALTER TABLE "RailwayLine"
  ADD COLUMN "currentStatus" "OperationalStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "currentDescription" TEXT,
  ADD COLUMN "currentSource" TEXT,
  ADD COLUMN "currentSourceEventId" TEXT,
  ADD COLUMN "sourceUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "lastCollectedAt" TIMESTAMP(3);

ALTER TABLE "StatusEvent"
  ADD COLUMN "sourceEventId" TEXT,
  ADD COLUMN "sourceUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "endedAt" TIMESTAMP(3);

UPDATE "StatusEvent" SET "source" = 'legacy' WHERE "source" IS NULL;
UPDATE "StatusEvent" SET "status" = 'UNKNOWN' WHERE "status" NOT IN ('NORMAL','REDUCED_SPEED','PARTIAL_OPERATION','INTERRUPTED','CLOSED','PLANNED_MAINTENANCE','UNKNOWN');
ALTER TABLE "StatusEvent" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "StatusEvent" ALTER COLUMN "status" TYPE "OperationalStatus" USING "status"::"OperationalStatus";
DROP INDEX "StatusEvent_lineId_occurredAt_idx";
DROP INDEX "StatusEvent_status_idx";
ALTER TABLE "StatusEvent" DROP COLUMN "occurredAt";
CREATE INDEX "StatusEvent_lineId_collectedAt_idx" ON "StatusEvent"("lineId", "collectedAt");
CREATE INDEX "StatusEvent_lineId_status_idx" ON "StatusEvent"("lineId", "status");
CREATE INDEX "StatusEvent_sourceEventId_idx" ON "StatusEvent"("sourceEventId");
