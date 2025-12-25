/*
  Warnings:

  - A unique constraint covering the columns `[doctorId]` on the table `doctor_contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "doctor_descriptions" ADD COLUMN     "gender" "gender" NOT NULL DEFAULT 'MALE';

-- CreateIndex
CREATE UNIQUE INDEX "doctor_contacts_doctorId_key" ON "doctor_contacts"("doctorId");
