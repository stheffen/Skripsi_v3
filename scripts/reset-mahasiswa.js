// Script: Hapus semua akun MAHASISWA saja di next-app-v2 (dosen tetap)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Hapus PermohonanGantiDosen yang dimiliki mahasiswa terlebih dahulu (jika ada FK constraint)
  const deletedPermohonan = await prisma.permohonanGantiDosen.deleteMany({});
  console.log(`🗑️  Hapus ${deletedPermohonan.count} data permohonan ganti dosen.`);

  // Hapus DosenMahasiswa (relasi dosen-mahasiswa)
  const deletedRelasi = await prisma.dosenMahasiswa.deleteMany({});
  console.log(`🗑️  Hapus ${deletedRelasi.count} data relasi dosen-mahasiswa.`);

  // Hapus semua user dengan role mahasiswa (cascade akan hapus KHS dan AnalisisRisiko)
  const deleted = await prisma.user.deleteMany({
    where: { role: 'mahasiswa' }
  });
  console.log(`✅ Berhasil menghapus ${deleted.count} akun mahasiswa dari next-app-v2.`);
  console.log('ℹ️  Akun dosen tetap dipertahankan.');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
