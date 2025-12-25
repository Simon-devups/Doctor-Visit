/*
  Warnings:

  - The primary key for the `User_informations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatar` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `comments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `User_informations` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `gender` on the `User_informations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `avatar_url` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Appointments" DROP CONSTRAINT "Appointments_patientId_fkey";

-- AlterTable
ALTER TABLE "User_informations" DROP CONSTRAINT "User_informations_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "user_id" DROP DEFAULT,
DROP COLUMN "gender",
ADD COLUMN     "gender" "gender" NOT NULL,
ADD CONSTRAINT "User_informations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_informations_user_id_seq";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "avatar",
ADD COLUMN     "avatar_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "data",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "User_informations_user_id_key" ON "User_informations"("user_id");

-- AddForeignKey
ALTER TABLE "User_informations" ADD CONSTRAINT "User_informations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User_informations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
