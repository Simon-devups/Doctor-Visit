import prisma from "./prismaClient.js"


async function main() {

  const spetialty = await prisma.spetialty.createMany({
    data: [
      {
      spetialty: 'متخصص پوست',
    },
    {
      spetialty: 'چشم پزشک',
    },
    {
      spetialty: 'متخصص ارتودنسی',
    },
    ]
  });

  const doctor = await prisma.doctors.createMany({
    data: [{
      first_name: 'نیما',
      last_name: 'شمشیری',
      spetialty_id: 1,
      image_url:'image (1).png'
    },
    {
      first_name: 'فریار',
      last_name: 'انصاری',
      spetialty_id: 3,
      image_url:'image.png'
    },{
      first_name: 'سجاد ',
      last_name: 'پیغمبردوست',
      spetialty_id: 2,
      image_url:'3.png'
    },
    {
      first_name: 'آرین',
      last_name: 'شفیع راد',
      spetialty_id: 2,
      image_url:'2.png'
    },
  ]
  });

  const doctorDesc = await prisma.doctor_descriptions.createMany({
    data: [
      {
      doctorId: 1,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'تبریز - آبرسان - چهارراه آبرسان',
      city:'تبریز',
      code: 'DOC001',
    },{
      doctorId: 2,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'تهران - آبرسان - چهارراه آبرسان',
      city:'تهران',
      code: 'DOC001',
    },{
      doctorId: 3,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'اصفهان - آبرسان - چهارراه آبرسان',
      city:'اصفهان',
      code: 'DOC001',
    },{
      doctorId: 4,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'تبریز - آبرسان - چهارراه آبرسان',
      city:'تبریز',
      code: 'DOC001',
    },
    ]
  });

  // 
  const doctorContact = await prisma.doctor_contacts.createMany({
    data: [
      {
      doctorId: 1,
      phone: '09120000000',
      instagram: '@dr.nima',
      web: 'www.dr-shamshiri.com',
      web2: '',
    },{
      doctorId: 2,
      phone: '09120000000',
      instagram: '@dr.fariar',
      web: 'www.dr-ansari.com',
      web2: '',
    },{
      doctorId: 3,
      phone: '09120000000',
      instagram: '@dr.sajjad',
      web: 'www.dr-sajjadpd.com',
      web2: '',
    },{
      doctorId: 4,
      phone: '09120000000',
      instagram: '@dr.arian',
      web: 'www.dr-shafirad.com',
      web2: '',
    },
    ]
  });

  const doctorPrice = await prisma.doctor_prices.createMany({
    data: [
      {
      doctor_id: 1,
      price: '500000',
    },{
      doctor_id: 2,
      price: '350000',
    },{
      doctor_id: 3,
      price: '300000',
    },{
      doctor_id: 4,
      price: '400000',
    },
    ]
  });

  const user = await prisma.user_informations.create({
    data: {
      code_meli: '1234567890',
      birthday: '2000-01-01',
      gender: 'male',
      city: 'Tehran',
      email: 'ali@example.com',
    },
  });

  const appointment = await prisma.appointments.create({
    data: {
      doctorId: 1,
      patientId: user.user_id,
      date: new Date('2025-11-25T10:00:00.000Z'),
      startTime: '10:00',
      endTime: '10:30',
      status: 'RESERVED',
    },
  });

  const comment = await prisma.comments.create({
    data: {
      doctor_id: 1,
      user_id: user.user_id,
      comment: 'Great doctor!',
    },
  });

  // 9️⃣ اضافه کردن یک Score
  const score = await prisma.score.create({
    data: {
      doctor_id: 1,
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
