/*
  Warnings:

  - A unique constraint covering the columns `[spetialty]` on the table `spetialty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `doctor_descriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctor_descriptions" ADD COLUMN     "city" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "image_url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "spetialty_spetialty_key" ON "spetialty"("spetialty");

-- AddForeignKey
ALTER TABLE "doctor_descriptions" ADD CONSTRAINT "doctor_descriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
