const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function run() { 
  const user = await prisma.user.findFirst({where: {nim: '12321313'}}); 
  if (user) { 
    await prisma.khs.deleteMany({where: {user_id: user.id}}); 
    console.log('Deleted KHS for demo3 (NIM 12321313)'); 
  } 
} 

run().finally(() => { prisma.$disconnect() });
