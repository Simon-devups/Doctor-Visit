import prisma from "./prismaClient.js"

//
const getDoctors = async()=>{
    const result = await prisma.doctors.findMany({
        include:{
            spetialty:true,
            description:true
        }
    });
    return result
}

const getSpecifiedDoctors = async(where)=>{
    const doctors = await prisma.doctors.findMany({
      where,
      include: {
        spetialty: true,
        description: true
      }
    });
    return doctors
}

const getTopDoctors = async()=>{
    const result = await prisma.doctors.findMany({
        orderBy:{
            totalReservs:'desc'
        },
        include:{
            spetialty:true,
            description:true
        },
        take:4
    })
    return result
}

const getOldDoctors = async()=>{
    const result = await prisma.doctors.findMany({
        orderBy:{
            createdAt:'desc'
        },
        include:{
            spetialty:true,
            description:true
        },
        take:4
    })
    return result
}

const getDoctorById = async (doctorId)=>{
    const result = await prisma.doctors.findUnique({
        where:{id:doctorId},
        include:{
            spetialty:true,
            description:true
        }
    })
    return result
}

const getDoctorBySpetialty = async(spetialty)=>{
    const result = await prisma.doctors.findMany({
        where:{
            spetialty:{spetialty:spetialty}
        },
        // include:{spetialty:true,doctorDesc:true},
    })
    return result
}

const getDoctorByFirstName = async(firstName)=>{
    const result = await prisma.doctors.findMany({
        where:{first_name:firstName},
        // include:{spetialty:true,
        //     doctorDesc:true
        // }
    })
    return result
}

const getDoctorByLastName = async(lastName)=>{
    const result = await prisma.doctors.findMany({
        where:{last_name:lastName}
    })
    return result
}

const getSpetialties = async ()=>{
    const result = await prisma.spetialty.findMany()
    return result
}

const getCities = async()=>{
    const cities = await prisma.doctor_descriptions.findMany({
        select:{
            city:true
        }}
    )
    return cities
}




const queries = {getDoctors,getDoctorById,getDoctorBySpetialty,
    getDoctorByFirstName,getDoctorByLastName,getSpetialties,getSpecifiedDoctors,
    getCities,getTopDoctors,getOldDoctors,
}

export default queries;