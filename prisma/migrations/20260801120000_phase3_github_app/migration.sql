-- Phase 3: GitHub App additive fields for Installation + Repository

ALTER TABLE "Installation" ADD COLUMN "accountLogin" TEXT,
ADD COLUMN "accountType" TEXT,
ADD COLUMN "suspendedAt" TIMESTAMP(3);

CREATE INDEX "Installation_status_idx" ON "Installation"("status");

ALTER TABLE "Repository" ADD COLUMN "nodeId" TEXT,
ADD COLUMN "defaultBranch" TEXT,
ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "permissions" JSONB,
ADD COLUMN "connectedAt" TIMESTAMP(3);

CREATE INDEX "Repository_deletedAt_idx" ON "Repository"("deletedAt");
