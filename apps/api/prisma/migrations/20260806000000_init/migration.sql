CREATE TABLE "RailwayLine" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"number" TEXT NOT NULL,"name" TEXT NOT NULL,"operator" TEXT NOT NULL,"color" TEXT,"active" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "RailwayLine_pkey" PRIMARY KEY ("id"));
CREATE TABLE "StatusEvent" ("id" TEXT NOT NULL,"lineId" TEXT NOT NULL,"status" TEXT NOT NULL,"description" TEXT,"source" TEXT,"occurredAt" TIMESTAMP(3) NOT NULL,"collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "StatusEvent_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RailwayLine_code_key" ON "RailwayLine"("code");
CREATE INDEX "StatusEvent_lineId_occurredAt_idx" ON "StatusEvent"("lineId", "occurredAt");
CREATE INDEX "StatusEvent_status_idx" ON "StatusEvent"("status");
ALTER TABLE "StatusEvent" ADD CONSTRAINT "StatusEvent_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "RailwayLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
