-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "canvasId" TEXT;

-- AlterTable
ALTER TABLE "CourseModule" ADD COLUMN     "canvasId" TEXT;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "canvasId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "canvasAssignmentId" TEXT,
ADD COLUMN     "canvasId" TEXT;
