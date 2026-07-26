-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('user', 'organization');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('admin', 'maintainer', 'developer', 'viewer');

-- CreateEnum
CREATE TYPE "InstallationStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('idle', 'syncing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "IssueState" AS ENUM ('draft', 'open', 'claimed', 'in-progress', 'review', 'blocked', 'ready-to-merge', 'closed');

-- CreateEnum
CREATE TYPE "IssuePriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard', 'unknown');

-- CreateEnum
CREATE TYPE "IssueEventType" AS ENUM ('status-change', 'comment', 'assignment', 'label-change', 'review');

-- CreateEnum
CREATE TYPE "IssueDependencyType" AS ENUM ('depends-on', 'blocks');

-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('draft', 'open', 'review', 'approved', 'merged', 'closed');

-- CreateEnum
CREATE TYPE "CiStatus" AS ENUM ('success', 'failure', 'pending');

-- CreateEnum
CREATE TYPE "FileChangeStatus" AS ENUM ('added', 'modified', 'deleted');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('passed', 'failed', 'pending');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('approve', 'request-changes', 'comment');

-- CreateEnum
CREATE TYPE "ApprovalRecommendation" AS ENUM ('approve', 'request-changes', 'comment');

-- CreateEnum
CREATE TYPE "SecurityRisk" AS ENUM ('critical', 'high', 'medium', 'low', 'none');

-- CreateEnum
CREATE TYPE "HealthCiStatus" AS ENUM ('passing', 'failing', 'unknown');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('active', 'inactive', 'error');

-- CreateEnum
CREATE TYPE "AutomationNodeType" AS ENUM ('trigger', 'action', 'condition', 'notification');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('success', 'failure', 'skipped');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('pr_merged', 'issue_assigned', 'review_requested', 'automation', 'system');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('received', 'processing', 'processed', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "type" "OrganizationType" NOT NULL,
    "avatarUrl" TEXT,
    "ownerUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" UUID NOT NULL,
    "githubInstallationId" BIGINT NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" "InstallationStatus" NOT NULL DEFAULT 'active',
    "permissions" JSONB NOT NULL,
    "webhookEvents" TEXT[],
    "rateLimitRemaining" INTEGER,
    "rateLimitLimit" INTEGER,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'idle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "installationId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "language" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "openPRs" INTEGER NOT NULL DEFAULT 0,
    "collaborators" INTEGER NOT NULL DEFAULT 0,
    "topics" TEXT[],
    "healthScore" INTEGER,
    "automationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automationIssuesResolved" INTEGER NOT NULL DEFAULT 0,
    "automationPRsMerged" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedGitHub" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "company" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "isBotAccount" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),
    "lastActive" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoContributor" (
    "repositoryId" UUID NOT NULL,
    "contributorId" UUID NOT NULL,
    "contributions" INTEGER NOT NULL DEFAULT 0,
    "issuesOpened" INTEGER NOT NULL DEFAULT 0,
    "issuesClosed" INTEGER NOT NULL DEFAULT 0,
    "prOpened" INTEGER NOT NULL DEFAULT 0,
    "prMerged" INTEGER NOT NULL DEFAULT 0,
    "prRejected" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "averageReviewTime" TEXT,
    "averageMergeTime" TEXT,
    "isMaintainer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RepoContributor_pkey" PRIMARY KEY ("repositoryId","contributorId")
);

-- CreateTable
CREATE TABLE "ContributorBadge" (
    "id" UUID NOT NULL,
    "contributorId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributorBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" "IssueState" NOT NULL DEFAULT 'open',
    "priority" "IssuePriority",
    "estimatedDifficulty" "Difficulty" NOT NULL DEFAULT 'unknown',
    "estimatedCompletionTime" TEXT,
    "potentialFilesAffected" TEXT[],
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "authorContributorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueLabel" (
    "issueId" UUID NOT NULL,
    "labelId" UUID NOT NULL,

    CONSTRAINT "IssueLabel_pkey" PRIMARY KEY ("issueId","labelId")
);

-- CreateTable
CREATE TABLE "IssueAssignee" (
    "issueId" UUID NOT NULL,
    "contributorId" UUID NOT NULL,

    CONSTRAINT "IssueAssignee_pkey" PRIMARY KEY ("issueId","contributorId")
);

-- CreateTable
CREATE TABLE "IssueDependency" (
    "issueId" UUID NOT NULL,
    "dependsOnIssueId" UUID NOT NULL,
    "type" "IssueDependencyType" NOT NULL,

    CONSTRAINT "IssueDependency_pkey" PRIMARY KEY ("issueId","dependsOnIssueId","type")
);

-- CreateTable
CREATE TABLE "IssueEvent" (
    "id" UUID NOT NULL,
    "issueId" UUID NOT NULL,
    "type" "IssueEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actor" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueChecklistItem" (
    "id" UUID NOT NULL,
    "issueId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "IssueChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" UUID NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" "PullRequestState" NOT NULL DEFAULT 'open',
    "authorContributorId" UUID,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "reviewRequests" INTEGER NOT NULL DEFAULT 0,
    "ciStatus" "CiStatus",
    "testCoverageCurrent" INTEGER,
    "testCoverageChange" INTEGER,
    "documentationCoverage" BOOLEAN,
    "mergeReadinessScore" INTEGER,
    "aiReviewCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrFileChange" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "file" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changes" INTEGER NOT NULL DEFAULT 0,
    "status" "FileChangeStatus" NOT NULL,
    "diff" TEXT,

    CONSTRAINT "PrFileChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrCheck" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrReview" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "reviewerContributorId" UUID NOT NULL,
    "state" "ReviewState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "parentCommentId" UUID,
    "authorContributorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "file" TEXT,
    "line" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReview" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "keyFindings" TEXT[],
    "approvalRecommendation" "ApprovalRecommendation" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "securityRisk" "SecurityRisk" NOT NULL DEFAULT 'none',
    "securityIssues" JSONB,
    "performanceIssues" JSONB,
    "breakingChanges" JSONB,
    "suggestedChanges" JSONB,
    "mergeBlockers" TEXT[],
    "mergeWarnings" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrClosesIssue" (
    "pullRequestId" UUID NOT NULL,
    "issueId" UUID NOT NULL,

    CONSTRAINT "PrClosesIssue_pkey" PRIMARY KEY ("pullRequestId","issueId")
);

-- CreateTable
CREATE TABLE "RepositoryHealth" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "codeQuality" INTEGER NOT NULL,
    "documentation" INTEGER NOT NULL,
    "issueBacklog" INTEGER NOT NULL,
    "prBacklog" INTEGER NOT NULL,
    "contributorActivity" INTEGER NOT NULL,
    "ciStatus" "HealthCiStatus" NOT NULL,
    "releaseFrequency" TEXT NOT NULL,
    "automationCoverage" INTEGER NOT NULL,
    "securityAlerts" INTEGER NOT NULL,
    "dependencyHealth" INTEGER NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "InsightSeverity" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "quickFixAvailable" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "repositoryId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "workflowId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "AutomationStatus" NOT NULL DEFAULT 'inactive',
    "runsCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" INTEGER NOT NULL DEFAULT 0,
    "lastExecutionAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationNode" (
    "id" UUID NOT NULL,
    "automationId" UUID NOT NULL,
    "type" "AutomationNodeType" NOT NULL,
    "subtype" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "NodeStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "AutomationNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" UUID NOT NULL,
    "automationId" UUID NOT NULL,
    "webhookEventId" UUID,
    "status" "AutomationRunStatus" NOT NULL,
    "trigger" TEXT NOT NULL,
    "detail" JSONB,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "repositoryId" UUID,
    "title" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "action" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "model" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "repositoryId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "manifest" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginInstallation" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "repositoryId" UUID,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PluginInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" UUID NOT NULL,
    "installationId" UUID,
    "deliveryId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "action" TEXT,
    "payload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3),
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "scopes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_githubId_key" ON "Organization"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_login_key" ON "Organization"("login");

-- CreateIndex
CREATE INDEX "Organization_ownerUserId_idx" ON "Organization"("ownerUserId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_githubInstallationId_key" ON "Installation"("githubInstallationId");

-- CreateIndex
CREATE INDEX "Installation_organizationId_idx" ON "Installation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_organizationId_idx" ON "Repository"("organizationId");

-- CreateIndex
CREATE INDEX "Repository_installationId_idx" ON "Repository"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_repositoryId_name_key" ON "Label"("repositoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_githubId_key" ON "Contributor"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_login_key" ON "Contributor"("login");

-- CreateIndex
CREATE INDEX "RepoContributor_contributorId_idx" ON "RepoContributor"("contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "ContributorBadge_contributorId_type_key" ON "ContributorBadge"("contributorId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_githubId_key" ON "Issue"("githubId");

-- CreateIndex
CREATE INDEX "Issue_repositoryId_state_idx" ON "Issue"("repositoryId", "state");

-- CreateIndex
CREATE INDEX "Issue_authorContributorId_idx" ON "Issue"("authorContributorId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_repositoryId_number_key" ON "Issue"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "IssueEvent_issueId_createdAt_idx" ON "IssueEvent"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "IssueChecklistItem_issueId_idx" ON "IssueChecklistItem"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_githubId_key" ON "PullRequest"("githubId");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_state_idx" ON "PullRequest"("repositoryId", "state");

-- CreateIndex
CREATE INDEX "PullRequest_ciStatus_idx" ON "PullRequest"("ciStatus");

-- CreateIndex
CREATE INDEX "PullRequest_authorContributorId_idx" ON "PullRequest"("authorContributorId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "PrFileChange_pullRequestId_idx" ON "PrFileChange"("pullRequestId");

-- CreateIndex
CREATE INDEX "PrCheck_pullRequestId_idx" ON "PrCheck"("pullRequestId");

-- CreateIndex
CREATE INDEX "PrReview_pullRequestId_idx" ON "PrReview"("pullRequestId");

-- CreateIndex
CREATE INDEX "ReviewComment_pullRequestId_createdAt_idx" ON "ReviewComment"("pullRequestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIReview_pullRequestId_key" ON "AIReview"("pullRequestId");

-- CreateIndex
CREATE INDEX "RepositoryHealth_repositoryId_measuredAt_idx" ON "RepositoryHealth"("repositoryId", "measuredAt" DESC);

-- CreateIndex
CREATE INDEX "AIInsight_repositoryId_createdAt_idx" ON "AIInsight"("repositoryId", "createdAt");

-- CreateIndex
CREATE INDEX "Workflow_organizationId_idx" ON "Workflow"("organizationId");

-- CreateIndex
CREATE INDEX "Workflow_repositoryId_idx" ON "Workflow"("repositoryId");

-- CreateIndex
CREATE INDEX "Automation_repositoryId_idx" ON "Automation"("repositoryId");

-- CreateIndex
CREATE INDEX "Automation_workflowId_idx" ON "Automation"("workflowId");

-- CreateIndex
CREATE INDEX "AutomationNode_automationId_idx" ON "AutomationNode"("automationId");

-- CreateIndex
CREATE INDEX "AutomationRun_automationId_createdAt_idx" ON "AutomationRun"("automationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AIConversation_userId_updatedAt_idx" ON "AIConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AIConversation_repositoryId_idx" ON "AIConversation"("repositoryId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_slug_key" ON "Plugin"("slug");

-- CreateIndex
CREATE INDEX "PluginInstallation_organizationId_idx" ON "PluginInstallation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PluginInstallation_pluginId_organizationId_repositoryId_key" ON "PluginInstallation"("pluginId", "organizationId", "repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_deliveryId_key" ON "WebhookEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "WebhookEvent_event_createdAt_idx" ON "WebhookEvent"("event", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoContributor" ADD CONSTRAINT "RepoContributor_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoContributor" ADD CONSTRAINT "RepoContributor_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorBadge" ADD CONSTRAINT "ContributorBadge_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_authorContributorId_fkey" FOREIGN KEY ("authorContributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueAssignee" ADD CONSTRAINT "IssueAssignee_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueAssignee" ADD CONSTRAINT "IssueAssignee_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_dependsOnIssueId_fkey" FOREIGN KEY ("dependsOnIssueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueEvent" ADD CONSTRAINT "IssueEvent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueChecklistItem" ADD CONSTRAINT "IssueChecklistItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_authorContributorId_fkey" FOREIGN KEY ("authorContributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrFileChange" ADD CONSTRAINT "PrFileChange_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrCheck" ADD CONSTRAINT "PrCheck_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrReview" ADD CONSTRAINT "PrReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrReview" ADD CONSTRAINT "PrReview_reviewerContributorId_fkey" FOREIGN KEY ("reviewerContributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "ReviewComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_authorContributorId_fkey" FOREIGN KEY ("authorContributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReview" ADD CONSTRAINT "AIReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrClosesIssue" ADD CONSTRAINT "PrClosesIssue_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrClosesIssue" ADD CONSTRAINT "PrClosesIssue_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryHealth" ADD CONSTRAINT "RepositoryHealth_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNode" ADD CONSTRAINT "AutomationNode_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_webhookEventId_fkey" FOREIGN KEY ("webhookEventId") REFERENCES "WebhookEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginInstallation" ADD CONSTRAINT "PluginInstallation_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginInstallation" ADD CONSTRAINT "PluginInstallation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginInstallation" ADD CONSTRAINT "PluginInstallation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

