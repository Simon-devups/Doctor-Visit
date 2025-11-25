import pkg from './generated/prisma/index.js';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
// const prisma = new pkg();


export default prisma;