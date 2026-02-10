/*
  Warnings:

  - A unique constraint covering the columns `[doctorId]` on the table `doctor_descriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[doctor_id]` on the table `doctor_prices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[doctor_id]` on the table `score` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `suggest` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "avatar_url" SET DEFAULT 'empty.png';

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "suggest" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "doctor_descriptions_doctorId_key" ON "doctor_descriptions"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_prices_doctor_id_key" ON "doctor_prices"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "score_doctor_id_key" ON "score"("doctor_id");
