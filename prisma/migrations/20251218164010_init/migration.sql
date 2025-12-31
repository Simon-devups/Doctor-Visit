/*
  Warnings:

  - The values [RESERVED,COMPLETED] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endTime` on the `Appointments` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Appointments` table. All the data in the column will be lost.
  - Added the required column `insurance` to the `doctor_descriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalReservs` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('CONFIRMED', 'PENDING', 'CANCELED', 'DONE');
ALTER TABLE "public"."Appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "Appointments" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
COMMIT;

-- AlterTable
ALTER TABLE "Appointments" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "doctor_descriptions" ADD COLUMN     "insurance" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalReservs" INTEGER NOT NULL;
