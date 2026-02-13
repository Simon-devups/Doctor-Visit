import prisma from "./prismaClient.js"

//
const getDoctors = async () => {
    const result = await prisma.doctors.findMany({
        include: {
            spetialty: true,
            description: true
        }
    });
    return result
}

const getTopDoctors = async () => {
    const result = await prisma.doctors.findMany({
        orderBy: {
            totalReservs: 'desc'
        },
        include: {
            spetialty: true,
            description: true
        },
        take: 4
    })
    return result
}

const getOldDoctors = async () => {
    const result = await prisma.doctors.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            spetialty: true,
            description: true
        },
        take: 4
    })
    return result
}

const getDoctorBySpetialty = async (spetialty) => {
    const result = await prisma.doctors.findMany({
        where: {
            spetialty: { spetialty: spetialty }
        },
        // include:{spetialty:true,doctorDesc:true},
    })
    return result
}

// ----------------------------------------------------------------------------------------------------
// COMMENTS QUERIES 
const getDoctorComments = async (doctorId) => {
    const result = await prisma.comments.findMany({
        where: {
            doctor_id: doctorId
        },
        include:{
            user:true
        },
        orderBy:{
            date:'desc'
        }
        
    })
    return result
}

const addCommentToDoctor = async(data)=>{
    const result = await prisma.comments.create({
        data
    })
}

// ----------------------------------------------------------------------------------------------------
// DOCTOR DETAILS IN FLOW PAGE
const getDoctorById = async (doctorId) => {
    const result = await prisma.doctors.findUnique({
        where: { id: doctorId },
        include: {
            spetialty: true,
            description: true
        }
    })
    return result
}

const getDoctorContacts = async(doctorId)=>{
    const result = await prisma.doctor_contacts.findUnique({
        where:{
            doctorId:doctorId
        }
    })
    return result
}

//callendar schedule
const getDoctorWorkingDays = async(doctorId)=>{
    const result = await prisma.workingHours.findMany({
        where:{
            doctorId:doctorId
        },
        select:{
            weekday:true,
        }
    })
    const out = result.map(item => item.weekday)
    return out
}

// تابع برای ایجاد بازه های زمانی بین زمان شروع و زمان پایان
function getTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    
    // تبدیل رشته‌های ساعت (مثلا 08:00) به شیء Date برای محاسبات راحت‌تر
    let start = new Date(`2026-01-01T${startTime}:00`);
    const end = new Date(`2026-01-01T${endTime}:00`);

    while (start < end) {
        // زمان فعلی را با فرمت HH:mm ذخیره می‌کنیم
        const currentSlot = start.toTimeString().slice(0, 5);
        
        // زمان بعدی را با اضافه کردن ۳۰ دقیقه محاسبه می‌کنیم
        start.setMinutes(start.getMinutes() + intervalMinutes);
        
        const nextSlot = start.toTimeString().slice(0, 5);

        // اگر زمان بعدی از زمان پایان بیشتر شد، حلقه را متوقف کن
        if (start <= end) {
            slots.push({
                start: currentSlot,
            });
        }
    }

    return slots;
}

async function getResevedAppointments(doctorId, targetDate) {
  // 1. تنظیم شروع و پایان روز مورد نظر
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 2. کوئری زدن به جدول Appointments
  const reservedSlots = await prisma.appointments.findMany({
    where: {
      doctorId: parseInt(doctorId),
      date: {
        gte: startOfDay, // بزرگتر یا مساوی شروع روز
        lte: endOfDay,   // کوچکتر یا مساوی پایان روز
      },
    },
    select: {
      date: true // فقط زمان رزرو شده را برمی‌گردانیم
    },
    orderBy: {
      date: 'asc' // مرتب‌سازی از صبح به شب
    }
  });

  //  استخراج ساعت‌ها به صورت ساده (مثلاً 10:00)
  return reservedSlots.map(appointment => {
    return appointment.date.toISOString().slice(11,16);
  });
}
const getDoctorEmptyTimes = async (doctorId , date)=>{
    // return number of weekday
    const weekday = (date.getDay() + 1) % 7;

    // const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    const result = await prisma.workingHours.findMany({
        where:{
            doctorId:doctorId,
            weekday:weekday
        },
        select:{
            start_time:true,
            end_time:true
        }
    });

    let slots = null;
    if(result.length>0){
        slots = getTimeSlots(result[0].start_time,result[0].end_time,60);
    }else{
        slots = 'رزرو شده'
    }


    const appointment = await getResevedAppointments(doctorId,date);
    console.log(appointment)
    const finalSchedule = slots.map(slot => ({
        ...slot,
        isAvailable: !appointment.includes(slot.start) // اگر در لیست رزروها نبود، یعنی خالی است
        }));
    // const availableSlots = slots.filter(slot => !appointment.includes(slot));
    console.log(finalSchedule)
    return finalSchedule
}

const addAppointmentToPendingList = async(doctorId,userId,date)=>{
    const result = await prisma.appointments.create({
        data:{
            doctorId:doctorId,
            patientId:userId,
            date:date,
            status:"PENDING"
        }
    })
}

const addAppointmentToConfirmedList = async(doctorId,userId)=>{
    const result = await prisma.appointments.updateMany({
        where:{
            doctorId:doctorId,
            patientId:userId,
        },
        data:{
            status:"CONFIRMED"
        }
    })
}


// const removeAppoitmentFromSlots = async(slots,)

// ----------------------------------------------------------------------------------------------------
// SEARCH PAGE
const getSpecifiedDoctors = async (where) => {
    const doctors = await prisma.doctors.findMany({
        where,
        include: {
            spetialty: true,
            description: true,
        }
    });
    return doctors
}

const getDoctorByFirstName = async (firstName) => {
    const result = await prisma.doctors.findMany({
        where: { first_name: firstName },
        // include:{spetialty:true,
        //     doctorDesc:true
        // }
    })
    return result
}

const getDoctorByLastName = async (lastName) => {
    const result = await prisma.doctors.findMany({
        where: { last_name: lastName }
    })
    return result
}

// ----------------------------------------------------------------------------------------------------
// login and sign up pages queries
const findUser = async (phone) => {
    const result = await prisma.users.findUnique({
        where: {
            phone: phone
        },
        include: {
            userInfo: true
        }
    })
    return result
}

const findUserById = async (id) => {
    const result = await prisma.users.findUnique({
        where: {
            id: id
        },
        include: {
            userInfo: true
        }
    })
    return result
}

const signUpUser = async (user, filename) => {
    const result = await prisma.users.create({
        data: {
            firt_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            avatar_url: filename,
            userInfo: {
                create: {
                    code_meli: user.code_meli,
                    birthday: user.birthday,
                    gender: user.gender,
                    city: user.city,
                    email: user.email,
                }
            }
        },
        include: {
            userInfo: true
        }
    })
}

const updateUser = async (userId, user) => {
    const result = await prisma.users.update({
        where: {
            id: userId
        },
        data: {
            firt_name: user.firstName,
            last_name: user.lastName,
            phone: user.mobile,
            userInfo: {
                update: {
                    where: { user_id: userId },
                    data: {
                        code_meli: user.nationalCode,
                        birthday: user.birthday,
                        gender: user.gender,
                        city: user.city,
                        email: user.email,
                    }
                }
            }
        },
        include: {
            userInfo: true
        }
    })
    return result
}

const updateUserPhoto = async (user, filename) => {
    const result = await prisma.users.update({
        where: {
            id: user.id
        },
        data: {
            avatar_url: filename
        }
    })
    return result
}


//flow3
const getDoctorPrice = async(doctorId)=>{
    const result = await prisma.doctor_prices.findMany({
        where:{
            doctor_id:doctorId
        }
    })
    return result[0].price
}



// ----------------------------------------------------------------------------------------------------
// USER RESERVE LIST 
const getConfermedUserAppointments = async(userId)=>{
    const result = await prisma.appointments.findMany({
        where:{
            patientId:userId,
            status:'CONFIRMED'
        },
        include:{
            doctor:true
        }
    })
    return result
}

const getPendingUserAppointments = async(userId)=>{
    const result = await prisma.appointments.findMany({
        where:{
            patientId:userId,
            status:'PENDING'
        },
        include:{
            doctor:true
        }
    })
    return result
}

const deleteAppointment = async(appointmentId)=>{
    const result = await prisma.appointments.delete({
        where:{
            id:appointmentId
        }
    })
}

// ----------------------------------------------------------------------------------------------------
//get fileds of inputs
const getSpetialties = async () => {
    const result = await prisma.spetialty.findMany()
    return result
}

const getCities = async () => {
    const cities = await prisma.doctor_descriptions.findMany({
        select: {
            city: true,
            insurance: true
        }
    }
    )
    return cities
}




const queries = {
    getDoctors, getDoctorById, getDoctorBySpetialty,
    getDoctorByFirstName, getDoctorByLastName, getSpetialties, getSpecifiedDoctors,
    getCities, getTopDoctors, getOldDoctors, findUser, signUpUser, findUserById, updateUser,
    updateUserPhoto, getDoctorComments,getDoctorContacts,addCommentToDoctor,getDoctorPrice,
    getDoctorWorkingDays,getDoctorEmptyTimes,getConfermedUserAppointments,
    addAppointmentToConfirmedList,addAppointmentToPendingList,deleteAppointment,
    
}

export default queries;