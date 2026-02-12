import { resolveInclude } from "ejs";
import prisma from "./prismaClient.js";

const findAdmin = async(name,number,code)=>{
    const result = await prisma.admin.findUniqe({
        where:{
            name:name,
            number:number,
            code:code
        }
    })
    return result
}



const queries = {
    findAdmin,
}

export default queries;