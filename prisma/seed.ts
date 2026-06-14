import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const kurikulum = [
    // ===== SEMESTER 1 =====
    { kode: 'TIPK101', nama: 'Pend. Agama Katolik/Etika Sosial', sks: 2, semester: 1, jenis: 'TIPK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK101', nama: 'Aljabar Linear', sks: 2, semester: 1, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB101', nama: 'Pengantar Teknologi Informasi', sks: 2, semester: 1, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK102', nama: 'Bahasa Inggris I', sks: 2, semester: 1, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK103', nama: 'Kalkulus I', sks: 3, semester: 1, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK104', nama: 'Algoritma dan Pemrograman', sks: 4, semester: 1, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK105', nama: 'Logika Pemrograman', sks: 3, semester: 1, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB106', nama: 'Paket Program Niaga', sks: 2, semester: 1, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },

    // ===== SEMESTER 2 =====
    { kode: 'TIKK205', nama: 'Bahasa Inggris II', sks: 2, semester: 2, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK206', nama: 'Kalkulus II', sks: 2, semester: 2, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK207', nama: 'Statistika', sks: 4, semester: 2, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK203', nama: 'Struktur Data', sks: 4, semester: 2, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB204', nama: 'Sistem Basis Data', sks: 4, semester: 2, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK208', nama: 'Sistem Informasi Manajemen', sks: 4, semester: 2, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },

    // ===== SEMESTER 3 =====
    { kode: 'TIPK302', nama: 'Pendidikan Kewarganegaraan', sks: 2, semester: 3, jenis: 'TIPK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB307', nama: 'Aplikasi Basis Data Dasar', sks: 4, semester: 3, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK310', nama: 'Matematika Diskrit', sks: 3, semester: 3, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK311', nama: 'Logika Informatika', sks: 3, semester: 3, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB305', nama: 'Pemrograman Berorientasi Objek', sks: 3, semester: 3, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB306', nama: 'Analisis dan Perancangan Sistem Informasi', sks: 4, semester: 3, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },

    // ===== SEMESTER 4 =====
    { kode: 'TIKK412', nama: 'Metode Numerik', sks: 3, semester: 4, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB407', nama: 'Riset Teknologi Informasi', sks: 2, semester: 4, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB408', nama: 'Pemrograman Visual', sks: 3, semester: 4, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB409', nama: 'Arsitektur dan Organisasi Komputer', sks: 4, semester: 4, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB410', nama: 'Rekayasa Perangkat Lunak', sks: 4, semester: 4, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB411', nama: 'Pemrograman Android', sks: 3, semester: 4, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },

    // ===== SEMESTER 5 =====
    { kode: 'TIKK513', nama: 'Metodologi Penelitian', sks: 3, semester: 5, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK514', nama: 'Teknik Kompilasi', sks: 3, semester: 5, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB512', nama: 'Pemrograman Visual Lanjutan', sks: 3, semester: 5, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB513', nama: 'Grafika Komputer', sks: 4, semester: 5, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKK515', nama: 'Teori Bahasa dan Automata', sks: 4, semester: 5, jenis: 'TIKK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKP501', nama: 'Konsentrasi Data Mining dan Warehouse', sks: 3, semester: 5, jenis: 'TIKP', is_pilihan: true, kelompok_pilihan: 'sem5' },

    // ===== SEMESTER 6 =====
    { kode: 'TIKB614', nama: 'Kerja Praktek', sks: 2, semester: 6, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB615', nama: 'Pemrograman Web', sks: 3, semester: 6, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB616', nama: 'Jaringan Komputer', sks: 4, semester: 6, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB617', nama: 'Sistem Operasi', sks: 4, semester: 6, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIBB601', nama: 'Kecakapan Inter Personal', sks: 2, semester: 6, jenis: 'TIBB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKP603', nama: 'Pemrograman Visual Basic .Net', sks: 3, semester: 6, jenis: 'TIKP', is_pilihan: true, kelompok_pilihan: 'sem6' },
    { kode: 'TIKP604', nama: 'Aplikasi Pemrograman Basis Data', sks: 3, semester: 6, jenis: 'TIKP', is_pilihan: true, kelompok_pilihan: 'sem6' },

    // ===== SEMESTER 7 =====
    { kode: 'TIPK703', nama: 'Bahasa Indonesia', sks: 2, semester: 7, jenis: 'TIPK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB718', nama: 'Kecerdasan Buatan', sks: 3, semester: 7, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB719', nama: 'Sistem Multimedia', sks: 4, semester: 7, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKB720', nama: 'Sistem Berkas', sks: 3, semester: 7, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIBB702', nama: 'Komputer dan Masyarakat', sks: 2, semester: 7, jenis: 'TIBB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIBB707', nama: 'Sistem Informasi Akuntansi', sks: 2, semester: 7, jenis: 'TIBB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIKP705', nama: 'Jaringan Komputer Lanjutan', sks: 3, semester: 7, jenis: 'TIKP', is_pilihan: true, kelompok_pilihan: 'sem7' },

    // ===== SEMESTER 8 =====
    { kode: 'TIKB821', nama: 'Interaksi Manusia dan Komputer', sks: 4, semester: 8, jenis: 'TIKB', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIPB801', nama: 'Etika Profesi', sks: 2, semester: 8, jenis: 'TIPK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIPK801', nama: 'Pendidikan Pancasila', sks: 2, semester: 8, jenis: 'TIPK', is_pilihan: false, kelompok_pilihan: null },
    { kode: 'TIBB803', nama: 'Skripsi', sks: 6, semester: 8, jenis: 'TIBB', is_pilihan: false, kelompok_pilihan: null },
  ]

  console.log('Seeding Mata Kuliah...')
  for (const mk of kurikulum) {
    await prisma.mataKuliah.upsert({
      where: { kode: mk.kode },
      update: mk,
      create: mk,
    })
  }

  console.log('Seeding Users...')
  const passwordHash = await bcrypt.hash('password', 10)

  // Dosen Demo
  await prisma.user.upsert({
    where: { email: 'dosen@demo.com' },
    update: {},
    create: {
      name: 'Dr. Pembimbing Akademik',
      email: 'dosen@demo.com',
      password: passwordHash,
      role: 'dosen',
      semester_aktif: 1,
    },
  })

  // Mahasiswa Demo
  const mahasiswa = await prisma.user.upsert({
    where: { email: 'mahasiswa@demo.com' },
    update: {},
    create: {
      name: 'Mahasiswa Demo',
      email: 'mahasiswa@demo.com',
      nim: '20230001',
      password: passwordHash,
      role: 'mahasiswa',
      semester_aktif: 3,
      angkatan: '2023',
    },
  })

  // Insert KHS Kosong for Mahasiswa Demo
  const allMk = await prisma.mataKuliah.findMany()
  for (const mk of allMk) {
    if (mk.semester <= 3) { // just till semester 3
      await prisma.khs.upsert({
        where: {
          user_id_mata_kuliah_id: {
            user_id: mahasiswa.id,
            mata_kuliah_id: mk.id,
          }
        },
        update: {},
        create: {
          user_id: mahasiswa.id,
          mata_kuliah_id: mk.id,
          semester_input: mk.semester,
        }
      })
    }
  }

  console.log('Seeding selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
