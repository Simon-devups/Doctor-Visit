import prisma from "./prismaClient.js"


async function main() {
  // 1️⃣ اضافه کردن یک Specialty
  const specialty = await prisma.spetialty.create({
    data: {
      spetialty: 'Cardiology',
    },
  });

  // 2️⃣ اضافه کردن یک Doctor
  const doctor = await prisma.doctors.create({
    data: {
      first_name: 'Ahmad',
      last_name: 'Ahmadi',
      spetialty_id: specialty.id,
    },
  });

  // 3️⃣ اضافه کردن doctor_descriptions
  const doctorDesc = await prisma.doctor_descriptions.create({
    data: {
      doctorId: doctor.id,
      description: 'Experienced cardiologist with 10 years of practice',
      Addres: 'Tehran, Valiasr St.',
      code: 'DOC001',
    },
  });

  // 4️⃣ اضافه کردن doctor_contacts
  const doctorContact = await prisma.doctor_contacts.create({
    data: {
      doctorId: doctor.id,
      phone: '09120000000',
      instagram: '@dr.ahmadi',
      web: 'www.dr-ahmadi.com',
      web2: '',
    },
  });

  // 5️⃣ اضافه کردن doctor_prices
  const doctorPrice = await prisma.doctor_prices.create({
    data: {
      doctor_id: doctor.id,
      price: '500000',
    },
  });

  // 6️⃣ اضافه کردن یک User
  const user = await prisma.user_informations.create({
    data: {
      code_meli: '1234567890',
      birthday: '2000-01-01',
      gender: 'male',
      city: 'Tehran',
      email: 'ali@example.com',
    },
  });

  // 7️⃣ اضافه کردن یک Appointment
  const appointment = await prisma.appointments.create({
    data: {
      doctorId: doctor.id,
      patientId: user.user_id,
      date: new Date('2025-11-25T10:00:00.000Z'),
      startTime: '10:00',
      endTime: '10:30',
      status: 'RESERVED',
    },
  });

  // 8️⃣ اضافه کردن یک Comment
  const comment = await prisma.comments.create({
    data: {
      doctor_id: doctor.id,
      user_id: user.user_id,
      comment: 'Great doctor!',
    },
  });

  // 9️⃣ اضافه کردن یک Score
  const score = await prisma.score.create({
    data: {
      doctor_id: doctor.id,
      score: 5,
    },
  });

  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
