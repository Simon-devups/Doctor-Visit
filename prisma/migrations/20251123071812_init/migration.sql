-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('RESERVED', 'PENDING', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "firt_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "avatar" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_informations" (
    "user_id" SERIAL NOT NULL,
    "code_meli" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_informations_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "spetialty_id" INTEGER NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spetialty" (
    "id" SERIAL NOT NULL,
    "spetialty" TEXT NOT NULL,

    CONSTRAINT "spetialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "appointment_time" TEXT NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointments" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'RESERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_descriptions" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "Addres" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "doctor_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_contacts" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "web" TEXT NOT NULL,
    "web2" TEXT NOT NULL,

    CONSTRAINT "doctor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_prices" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "price" TEXT NOT NULL,

    CONSTRAINT "doctor_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_spetialty_id_fkey" FOREIGN KEY ("spetialty_id") REFERENCES "spetialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User_informations"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
