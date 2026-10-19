-- CreateEnum
CREATE TYPE "MediaProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIJobType" AS ENUM ('EMBEDDING_GENERATION', 'IMAGE_ANALYSIS', 'IMAGE_METADATA', 'MEMORY_INDEXING', 'WEEKLY_REFLECTION');

-- CreateEnum
CREATE TYPE "EmbeddingSourceType" AS ENUM ('JOURNAL_ENTRY', 'MEDIA', 'AI_METADATA');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "preferences" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journals" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "journalId" UUID NOT NULL,
    "title" VARCHAR(500),
    "content" TEXT NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(500),
    "fileSize" INTEGER,
    "processingStatus" "MediaProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "placeName" VARCHAR(500),
    "geometry" geography(Point,4326) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embeddings" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "vector" vector NOT NULL,
    "model" VARCHAR(255) NOT NULL,
    "sourceType" "EmbeddingSourceType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processing" (
    "id" UUID NOT NULL,
    "entryId" UUID,
    "mediaId" UUID,
    "jobType" "AIJobType" NOT NULL,
    "status" "AIProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_metadata" (
    "id" UUID NOT NULL,
    "entryId" UUID,
    "mediaId" UUID,
    "metadataType" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL,
    "model" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_reflections" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "status" "AIProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "journalId" UUID,
    "title" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journals_userId_idx" ON "journals"("userId");

-- CreateIndex
CREATE INDEX "journals_userId_deletedAt_idx" ON "journals"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "journal_entries_journalId_idx" ON "journal_entries"("journalId");

-- CreateIndex
CREATE INDEX "journal_entries_journalId_occurredAt_idx" ON "journal_entries"("journalId", "occurredAt");

-- CreateIndex
CREATE INDEX "journal_entries_journalId_deletedAt_idx" ON "journal_entries"("journalId", "deletedAt");

-- CreateIndex
CREATE INDEX "media_entryId_idx" ON "media"("entryId");

-- CreateIndex
CREATE INDEX "media_entryId_deletedAt_idx" ON "media"("entryId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "locations_entryId_key" ON "locations"("entryId");

-- CreateIndex
CREATE INDEX "embeddings_entryId_idx" ON "embeddings"("entryId");

-- CreateIndex
CREATE INDEX "embeddings_entryId_sourceType_idx" ON "embeddings"("entryId", "sourceType");

-- CreateIndex
CREATE INDEX "ai_processing_entryId_idx" ON "ai_processing"("entryId");

-- CreateIndex
CREATE INDEX "ai_processing_mediaId_idx" ON "ai_processing"("mediaId");

-- CreateIndex
CREATE INDEX "ai_processing_status_idx" ON "ai_processing"("status");

-- CreateIndex
CREATE INDEX "ai_processing_jobType_status_idx" ON "ai_processing"("jobType", "status");

-- CreateIndex
CREATE INDEX "ai_metadata_entryId_idx" ON "ai_metadata"("entryId");

-- CreateIndex
CREATE INDEX "ai_metadata_mediaId_idx" ON "ai_metadata"("mediaId");

-- CreateIndex
CREATE INDEX "ai_metadata_metadataType_idx" ON "ai_metadata"("metadataType");

-- CreateIndex
CREATE INDEX "weekly_reflections_userId_idx" ON "weekly_reflections"("userId");

-- CreateIndex
CREATE INDEX "weekly_reflections_userId_periodStart_periodEnd_idx" ON "weekly_reflections"("userId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

-- CreateIndex
CREATE INDEX "conversations_journalId_idx" ON "conversations"("journalId");

-- CreateIndex
CREATE INDEX "conversations_userId_updatedAt_idx" ON "conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing" ADD CONSTRAINT "ai_processing_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing" ADD CONSTRAINT "ai_processing_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_metadata" ADD CONSTRAINT "ai_metadata_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_metadata" ADD CONSTRAINT "ai_metadata_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reflections" ADD CONSTRAINT "weekly_reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "journals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "locations_geometry_gist_idx"
ON "locations"
USING GIST ("geometry");