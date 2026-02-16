-- CreateTable
CREATE TABLE "doctorsAccount" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "natinalCode" INTEGER NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "doctorsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctorsAccount_doctor_id_key" ON "doctorsAccount"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctorsAccount_natinalCode_key" ON "doctorsAccount"("natinalCode");

-- AddForeignKey
ALTER TABLE "doctorsAccount" ADD CONSTRAINT "doctorsAccount_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
