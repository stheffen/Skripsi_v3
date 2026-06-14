const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function run() { 
  const user = await prisma.user.findUnique({where: {email: 'mahasiswa@demo.com'}}); 
  if (user) { 
    await prisma.khs.deleteMany({where: {user_id: user.id}}); 
    console.log('Deleted KHS for mahasiswa@demo.com'); 
  } 
} 

run().finally(() => { prisma.$disconnect() });
