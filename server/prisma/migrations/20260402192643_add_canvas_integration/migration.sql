-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "canvasId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canvasId" TEXT;

-- CreateTable
CREATE TABLE "CanvasConfig" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "accountId" TEXT NOT NULL DEFAULT '1',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasSyncLog" (
    "id" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "details" TEXT,
    "error" TEXT,
    "recordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CanvasSyncLog_pkey" PRIMARY KEY ("id")
);
