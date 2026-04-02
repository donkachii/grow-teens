/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `ContentUnit` table. All the data in the column will be lost.
  - You are about to drop the column `externalUrl` on the `ContentUnit` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `ContentUnit` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `ContentUnit` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `ContentUnit` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the column `unlockCondition` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the `CourseRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningOutcome` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseRequirement" DROP CONSTRAINT "CourseRequirement_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseTags" DROP CONSTRAINT "CourseTags_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningOutcome" DROP CONSTRAINT "LearningOutcome_courseId_fkey";

-- DropIndex
DROP INDEX "Course_type_idx";

-- AlterTable
ALTER TABLE "ContentUnit" DROP COLUMN "audioUrl",
DROP COLUMN "externalUrl",
DROP COLUMN "fileUrl",
DROP COLUMN "textContent",
DROP COLUMN "videoUrl",
ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "coverImage",
DROP COLUMN "overview",
DROP COLUMN "type",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "outcomes" TEXT[],
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "CourseModule" DROP COLUMN "thumbnail",
DROP COLUMN "unlockCondition",
ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "CourseRequirement";

-- DropTable
DROP TABLE "CourseTags";

-- DropTable
DROP TABLE "LearningOutcome";

-- DropEnum
DROP TYPE "CourseType";

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCourse" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "ProgramCourse_programId_idx" ON "ProgramCourse"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCourse_programId_courseId_key" ON "ProgramCourse"("programId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
