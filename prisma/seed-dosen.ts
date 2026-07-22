import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DOSEN_LIST = [
  {
    name: 'Alfred Yulius A.P., S.T., M.Kom.',
    email: 'alfred.yulius@widyadharma.ac.id',
  },
  {
    name: 'Amok Darmianto, S.Kom., M.Kom.',
    email: 'amok.darmianto@widyadharma.ac.id',
  },
  {
    name: 'Fredrikus Suarezsaga, S.T., M.T.',
    email: 'fredrikus.suarezsaga@widyadharma.ac.id',
  },
  {
    name: 'Dr. Genrawan Hoendarto, S.T., M.Kom.',
    email: 'genrawan.hoendarto@widyadharma.ac.id',
  },
  {
    name: 'Riyadi J.Iskandar, S.Kom., M.M., M.Kom.',
    email: 'riyadi.iskandar@widyadharma.ac.id',
  },
  {
    name: 'Sandi Tendean, S.Kom., M.Kom.',
    email: 'sandi.tendean@widyadharma.ac.id',
  }
];

async function main() {
  console.log('Start seeding dosen PA...');
  const hashedPassword = await bcrypt.hash('Informatika2024', 10);

  for (const dosen of DOSEN_LIST) {
    const existing = await prisma.user.findUnique({
      where: { email: dosen.email }
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          name: dosen.name,
          email: dosen.email,
          password: hashedPassword,
          role: 'dosen'
        }
      });
      console.log(`✅ Created dosen: ${dosen.name}`);
    } else {
      console.log(`⏩ Dosen already exists: ${dosen.name}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
