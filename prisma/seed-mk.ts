import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Mulai menyalin data mata kuliah dari aplikasi versi sebelumnya...");
  
  try {
    // Menggunakan queryRaw untuk membaca dari tabel lama yang tidak ada di schema v2
    const oldMk = await prisma.$queryRaw<any[]>`SELECT * FROM mata_kuliah`;
    
    if (!oldMk || oldMk.length === 0) {
      console.log("❌ Data mata kuliah di tabel lama kosong atau tabel tidak ditemukan.");
      return;
    }
    
    console.log(`📋 Ditemukan ${oldMk.length} mata kuliah. Memasukkan ke tabel aplikasi baru...`);
    
    let inserted = 0;
    for (const mk of oldMk) {
      try {
        await prisma.mataKuliah.upsert({
          where: { kode: mk.kode },
          update: {},
          create: {
            kode: mk.kode,
            nama: mk.nama,
            sks: mk.sks,
            semester: mk.semester,
            jenis: mk.jenis,
            is_pilihan: mk.is_pilihan,
            kelompok_pilihan: mk.kelompok_pilihan,
          }
        });
        inserted++;
      } catch (e) {
        // Abaikan error duplikat
      }
    }
    
    console.log(`✅ Berhasil menyalin ${inserted} mata kuliah ke versi baru!`);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
