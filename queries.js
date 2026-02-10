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

//add comment for doctor 
const addCommentToDoctor = async(data)=>{
    const result = await prisma.comments.create({
        data
    })
}

const getDoctorContacts = async(doctorId)=>{
    const result = await prisma.doctor_contacts.findUnique({
        where:{
            doctorId:doctorId
        }
    })
    return result
}

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

const getDoctorBySpetialty = async (spetialty) => {
    const result = await prisma.doctors.findMany({
        where: {
            spetialty: { spetialty: spetialty }
        },
        // include:{spetialty:true,doctorDesc:true},
    })
    return result
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

//callendar schedule
const getDoctorWorkingDays = async(doctorId)=>{
    const result = await prisma.workingHours.findMany({
        where:{
            doctorId:doctorId
        },
        select:{
            weekday:true,
            start_time:true,
            end_time:true
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
    getDoctorWorkingDays,getConfermedUserAppointments,addAppointmentToConfirmedList,addAppointmentToPendingList,
    deleteAppointment,
    
}

export default queries;