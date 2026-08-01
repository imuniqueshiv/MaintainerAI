-- Phase 4: Repository synchronization ledger + resource models (additive)

-- Enums
CREATE TYPE "SyncJobStatus" AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE "SyncEntityType" AS ENUM ('repository', 'issues', 'pull-requests', 'labels', 'milestones', 'releases', 'contributors', 'branches', 'statistics');
CREATE TYPE "SyncTrigger" AS ENUM ('manual', 'webhook', 'schedule', 'system');

-- Repository sync columns
ALTER TABLE "Repository" ADD COLUMN "homepage" TEXT,
ADD COLUMN "licenseSpdx" TEXT,
ADD COLUMN "syncStatus" "SyncStatus" NOT NULL DEFAULT 'idle',
ADD COLUMN "lastFullSyncAt" TIMESTAMP(3),
ADD COLUMN "lastIncrementalSyncAt" TIMESTAMP(3),
ADD COLUMN "syncError" TEXT;

CREATE INDEX "Repository_syncStatus_idx" ON "Repository"("syncStatus");

-- Label githubId
ALTER TABLE "Label" ADD COLUMN "githubId" BIGINT;
CREATE INDEX "Label_repositoryId_githubId_idx" ON "Label"("repositoryId", "githubId");

-- Issue additive fields
ALTER TABLE "Issue" ADD COLUMN "nodeId" TEXT,
ADD COLUMN "htmlUrl" TEXT,
ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "milestoneId" UUID,
ADD COLUMN "closedAt" TIMESTAMP(3),
ADD COLUMN "githubCreatedAt" TIMESTAMP(3),
ADD COLUMN "githubUpdatedAt" TIMESTAMP(3);

-- PullRequest additive fields
ALTER TABLE "PullRequest" ADD COLUMN "nodeId" TEXT,
ADD COLUMN "htmlUrl" TEXT,
ADD COLUMN "draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "merged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "mergeCommitSha" TEXT,
ADD COLUMN "baseRef" TEXT,
ADD COLUMN "headRef" TEXT,
ADD COLUMN "mergedAt" TIMESTAMP(3),
ADD COLUMN "closedAt" TIMESTAMP(3),
ADD COLUMN "githubCreatedAt" TIMESTAMP(3),
ADD COLUMN "githubUpdatedAt" TIMESTAMP(3);

-- Milestone
CREATE TABLE "Milestone" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL,
    "dueOn" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "htmlUrl" TEXT,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "closedIssues" INTEGER NOT NULL DEFAULT 0,
    "githubCreatedAt" TIMESTAMP(3),
    "githubUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Milestone_githubId_key" ON "Milestone"("githubId");
CREATE UNIQUE INDEX "Milestone_repositoryId_number_key" ON "Milestone"("repositoryId", "number");
CREATE INDEX "Milestone_repositoryId_state_idx" ON "Milestone"("repositoryId", "state");

ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Issue.milestoneId FK (after Milestone exists)
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Issue_milestoneId_idx" ON "Issue"("milestoneId");

-- Release
CREATE TABLE "Release" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "tagName" TEXT NOT NULL,
    "name" TEXT,
    "body" TEXT,
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "prerelease" BOOLEAN NOT NULL DEFAULT false,
    "htmlUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "githubCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Release_githubId_key" ON "Release"("githubId");
CREATE UNIQUE INDEX "Release_repositoryId_tagName_key" ON "Release"("repositoryId", "tagName");
CREATE INDEX "Release_repositoryId_publishedAt_idx" ON "Release"("repositoryId", "publishedAt" DESC);

ALTER TABLE "Release" ADD CONSTRAINT "Release_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Branch
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sha" TEXT,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Branch_repositoryId_name_key" ON "Branch"("repositoryId", "name");

ALTER TABLE "Branch" ADD CONSTRAINT "Branch_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SyncJob
CREATE TABLE "SyncJob" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "organizationId" UUID,
    "entity" "SyncEntityType" NOT NULL,
    "trigger" "SyncTrigger" NOT NULL DEFAULT 'manual',
    "status" "SyncJobStatus" NOT NULL DEFAULT 'queued',
    "mode" TEXT NOT NULL DEFAULT 'full',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "bullJobId" TEXT,
    "triggeredBy" UUID,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SyncJob_repositoryId_createdAt_idx" ON "SyncJob"("repositoryId", "createdAt" DESC);
CREATE INDEX "SyncJob_status_createdAt_idx" ON "SyncJob"("status", "createdAt");
CREATE INDEX "SyncJob_entity_status_idx" ON "SyncJob"("entity", "status");

ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SyncCheckpoint
CREATE TABLE "SyncCheckpoint" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "entity" "SyncEntityType" NOT NULL,
    "cursor" TEXT,
    "page" INTEGER NOT NULL DEFAULT 1,
    "since" TIMESTAMP(3),
    "etag" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastSuccessAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SyncCheckpoint_repositoryId_entity_key" ON "SyncCheckpoint"("repositoryId", "entity");
CREATE INDEX "SyncCheckpoint_repositoryId_idx" ON "SyncCheckpoint"("repositoryId");

ALTER TABLE "SyncCheckpoint" ADD CONSTRAINT "SyncCheckpoint_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
