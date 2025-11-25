import prisma from "./prismaClient.js"

//
const getDoctors = async()=>{
    const result = await prisma.doctors.findMany()
    return result
}

const getDoctorById = async (doctorId)=>{
    const result = await prisma.doctors.findUnique({
        where:{id:doctorId}
    })
    return result
}






const queries = {getDoctors,getDoctorById}

export default queries;