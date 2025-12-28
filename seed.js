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
    {
      spetialty: 'ارتوپد',
    },
    {
      spetialty: 'قلب و عروق',
    },
    ]
  });

  const doctor = await prisma.doctors.createMany({
    data: [{
      first_name: 'نیما',
      last_name: 'شمشیری',
      spetialty_id: 1,
      image_url:'image (1).png',
      totalReservs:1
    },
    {
      first_name: 'فریار',
      last_name: 'انصاری',
      spetialty_id: 3,
      image_url:'image.png',
      totalReservs:4
    },{
      first_name: 'سجاد ',
      last_name: 'پیغمبردوست',
      spetialty_id: 2,
      image_url:'3.png',
      totalReservs:2
    },
    {
      first_name: 'آرین',
      last_name: 'شفیع راد',
      spetialty_id: 2,
      image_url:'2.png',
      totalReservs:4
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
      insurance:'معلم',
      gender:"MALE"
    },{
      doctorId: 2,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'تهران - آبرسان - چهارراه آبرسان',
      city:'تهران',
      code: 'DOC001',
      insurance:'تامین اجتماعی',
      gender:'MALE'
    },{
      doctorId: 3,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'اصفهان - آبرسان - چهارراه آبرسان',
      city:'اصفهان',
      code: 'DOC001',
      insurance:'تامین اجتماعی',
      gender:'MALE'
    },{
      doctorId: 4,
      description: 'پزشک با تجربه در این حوضه',
      Addres: 'تبریز - آبرسان - چهارراه آبرسان',
      city:'تبریز',
      code: 'DOC001',
      insurance:'معلم',
      gender:'MALE'
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

  const user = await prisma.users.create({
    data:{
      firt_name:'سایمون',
      last_name:'',
      phone:'09920001122',
      avatar_url:'.',
    }
  })


  const userInfo = await prisma.user_informations.create({
    data: {
      user_id:1,
      code_meli: '1234567890',
      birthday: '2000-01-01',
      gender: 'MALE',
      city: 'Tehran',
      email: 'ali@example.com',
    },
  });

  const schedule = await prisma.workingHours.createMany({
    data: [
      {
        doctorId: 1,
        weekday: 6, // Saturday
        start_time: "09:00",
        end_time: "15:00",
      },
      {
        doctorId: 1,
        weekday: 0, // Sunday
        start_time: "09:00",
        end_time: "17:00",
      },
      {
        doctorId: 1,
        weekday: 1, // Monday
        start_time: "10:00",
        end_time: "17:00",
      },
      {
        doctorId: 1,
        weekday: 2, // Tuesday
        start_time: "09:00",
        end_time: "17:00",
      },
      {
        doctorId: 1,
        weekday: 3, // Wednesday
        start_time: "09:00",
        end_time: "17:00",
      },
      // doctor 2
      {
        doctorId: 2,
        weekday: 6, // Saturday
        start_time: "09:00",
        end_time: "15:00",
      },
      {
        doctorId: 2,
        weekday: 0, // Sunday
        start_time: "09:00",
        end_time: "17:00",
      },
      {
        doctorId: 2,
        weekday: 1, // Monday
        start_time: "10:00",
        end_time: "14:00",
      },
      {
        doctorId: 2,
        weekday: 2, // Tuesday
        start_time: "09:00",
        end_time: "17:00",
      },
      {
        doctorId: 2,
        weekday: 3, // Wednesday
        start_time: "09:00",
        end_time: "17:00",
      },

    ],
  });

  const appointment = await prisma.appointments.createMany({
    data: [
      {
      doctorId: 1,
      patientId: user.id,
      date: new Date('2025-11-25T10:00:00.000Z'),
      status: 'PENDING',
    },{
      doctorId: 1,
      patientId: user.id,
      date: new Date('2025-11-25T10:00:00.000Z'),
      status: 'CONFIRMED',
    },{
      doctorId: 2,
      patientId: user.id,
      date: new Date('2025-11-25T10:00:00.000Z'),
      status: 'CONFIRMED',
    },
    ]
  });

  const comment = await prisma.comments.createMany({
    data: [
      {
      doctor_id: 1,
      user_id: user.id,
      score:3,
      comment: 'از لحاظ اطلاعات و سواد دکتر خوبیه ولی بد اخلاقه .',
    },{
      doctor_id: 1,
      user_id: user.id,
      score:3,
      comment: 'یکم زیادی خشکه',
    },{
      doctor_id: 2,
      user_id: user.id,
      score:3,
      comment: 'خیلی با ادبه',
    },{
      doctor_id: 2,
      user_id: user.id,
      score:3,
      comment: 'اطلاعاتش خیلی زیاده ',
    },{
      doctor_id: 3,
      user_id: user.id,
      score:3,
      comment: 'خیلی خوش ادبه',
    },{
      doctor_id: 4,
      user_id: user.id,
      score:3,
      comment: 'با ادبه',
    },
  ]
  });

  // 9️⃣ اضافه کردن یک Score
  const score = await prisma.score.createMany({
    data: [
      {
      doctor_id: 1,
      score: 85,
    },{
      doctor_id: 1,
      score: 70,
    },{
      doctor_id: 1,
      score: 85,
    },{
      doctor_id: 1,
      score: 75,
    },
    ]
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
