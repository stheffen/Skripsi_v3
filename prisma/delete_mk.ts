import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.mataKuliah.deleteMany({where: {kode: {in: ['TIKP502', 'TIKP706']}}}).then(console.log);
