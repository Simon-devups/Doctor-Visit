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

const getDoctorBySpetialty = async(spetialty)=>{
    const result = await prisma.doctors.findMany({
        where:{spetialty:spetialty}
    })
    return result
}

const getDoctorByFirstName = async(firstName)=>{
    const result = await prisma.doctors.findMany({
        where:{first_name:firstName}
    })
    return result
}

const getDoctorByLastName = async(lastName)=>{
    const result = await prisma.doctors.findMany({
        where:{last_name:lastName}
    })
    return result
}


const getSearchedDoctor = async (searchString)=>{

    const searchedDoctors = []

    const stringList = searchString.toLowerCase().split(" ")
    stringList.forEach(async method=>{
        const fName = await getDoctorByFirstName(method)
        const lName = await getDoctorByLastName(method)
        const spti = await getDoctorBySpetialty(method)

        if(lName){
            searchedDoctors.concat(lName)
        }else if(spti){
            searchedDoctors.concat(spti)
        }else if( fName){
            searchedDoctors.concat(fName)
        }else{
            return null
        }
        
    })
    return searchedDoctors
    
}




const queries = {getDoctors,getDoctorById,getDoctorBySpetialty,
    getDoctorByFirstName,getDoctorByLastName,getSearchedDoctor}

export default queries;