export class RekomendasiService {
  /**
   * Buat rekomendasi akademik yang mendalam dan spesifik.
   *
   * @param kategori      'Tinggi' | 'Sedang' | 'Rendah'
   * @param ips           Indeks Prestasi Semester
   * @param ipk           Indeks Prestasi Kumulatif
   * @param mkBermasalah  Jumlah MK dengan nilai D/E
   * @param mkDetail      Array detail MK bermasalah
   */
  static buat(
    kategori: string,
    ips: number,
    ipk: number,
    mkBermasalah: number,
    mkDetail: any[] = []
  ): string {
    switch (kategori) {
      case 'Tinggi':
        return this.rekomendasiTinggi(ips, ipk, mkBermasalah, mkDetail);
      case 'Sedang':
        return this.rekomendasiSedang(ips, ipk, mkBermasalah, mkDetail);
      default:
        return this.rekomendasiRendah(ipk);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO TINGGI
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiTinggi(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[]): string {
    const lines: string[] = [];

    lines.push('🚨 STATUS RISIKO TINGGI');
    lines.push('Kondisi akademik Anda memerlukan tindakan segera. Jangan tunda konsultasi dengan Dosen Pembimbing Akademik (DPA).\n');

    // ── Analisis IPS ──────────────────────────────────────────────────
    lines.push('📊 ANALISIS NILAI SAAT INI:');
    if (ips < 1.5) {
      lines.push(`• IPS Anda (${ips.toFixed(2)}) sangat kritis — di bawah 1.5. Ini merupakan sinyal berbahaya yang harus segera diatasi.`);
    } else if (ips < 2.0) {
      lines.push(`• IPS Anda (${ips.toFixed(2)}) di bawah batas minimum (2.0). Perlu perbaikan signifikan di semester berikutnya.`);
    } else {
      lines.push(`• IPS Anda (${ips.toFixed(2)}) cukup namun kombinasi dengan faktor lain menempatkan Anda di risiko tinggi.`);
    }

    if (ipk < 2.0) {
      lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) di bawah 2.0 — batas minimum kelulusan banyak program studi. Segera perbaiki sebelum evaluasi akademik.`);
    } else if (ipk < 2.5) {
      lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) masih perlu ditingkatkan. Target minimal 2.75 untuk menjaga kelancaran studi.`);
    }
    lines.push('');

    // ── Daftar MK Bermasalah ─────────────────────────────────────────
    if (mkDetail.length > 0) {
      lines.push('❌ MATA KULIAH YANG HARUS DIULANG:');
      for (const mk of mkDetail) {
        const prioritas = mk.nilai === 'E' ? '[PRIORITAS UTAMA]' : '[Perlu Diulang]';
        lines.push(`• ${prioritas} ${mk.nama} (${mk.kode}) — Nilai: ${mk.nilai} — ${mk.sks} SKS — Sem ${mk.semester}`);
      }
      const totalSKSBermasalah = mkDetail.reduce((acc, mk) => acc + mk.sks, 0);
      lines.push(`  Total: ${mkBermasalah} mata kuliah (${totalSKSBermasalah} SKS) perlu diperbaiki.\n`);
    }

    // ── Konsekuensi Jika Dibiarkan ───────────────────────────────────
    lines.push('⚠️ KONSEKUENSI JIKA TIDAK SEGERA DIPERBAIKI:');
    if (ipk < 2.0) {
      lines.push('• Risiko evaluasi akademik / peringatan dari program studi.');
      lines.push('• Kemungkinan tidak dapat mengambil mata kuliah tertentu di semester berikutnya (prasyarat).');
      lines.push('• Risiko Drop Out (DO) jika IPK terus di bawah 2.0 hingga batas waktu evaluasi.');
    } else {
      lines.push('• Nilai MK D/E akan memperberat beban studi di semester mendatang jika harus diulang.');
      lines.push('• IPK yang tidak membaik dapat menghambat kelulusan tepat waktu.');
      lines.push('• Beberapa jalur karir/beasiswa mensyaratkan IPK minimal 3.0.');
    }
    if (mkBermasalah >= 3) {
      lines.push('• Banyaknya MK bermasalah dapat menunda kelulusan 1-2 semester jika tidak ditangani.');
    }
    lines.push('');

    // ── Rencana Aksi ─────────────────────────────────────────────────
    lines.push('✅ RENCANA AKSI SEGERA:');
    lines.push('1. Buat jadwal konsultasi dengan DPA dalam 1 minggu ke depan.');
    lines.push('2. Daftarkan diri untuk program remedial/perbaikan nilai jika tersedia.');
    lines.push('3. Prioritaskan pengulangan MK dengan nilai E terlebih dahulu, lalu D.');
    lines.push('4. Evaluasi jadwal dan beban studi — pertimbangkan mengurangi jumlah SKS semester depan.');
    lines.push('5. Tingkatkan kehadiran minimal 80% untuk semua mata kuliah.');
    lines.push('6. Manfaatkan layanan bimbingan belajar, tutor sebaya, atau konseling akademik kampus.');

    return lines.join('\n');
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO SEDANG
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiSedang(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[]): string {
    const lines: string[] = [];

    lines.push('⚠️ STATUS RISIKO SEDANG');
    lines.push('Performa Anda memerlukan perhatian. Dengan perbaikan yang tepat, risiko ini masih bisa ditekan.\n');

    // ── Analisis ─────────────────────────────────────────────────────
    lines.push('📊 ANALISIS NILAI SAAT INI:');
    if (ips < 2.5) {
      lines.push(`• IPS Anda (${ips.toFixed(2)}) di bawah rata-rata ideal (2.5). Perlu peningkatan di semester berikutnya.`);
    } else {
      lines.push(`• IPS Anda (${ips.toFixed(2)}) cukup, namun beberapa faktor menempatkan Anda di zona waspada.`);
    }
    if (ipk < 3.0) {
      lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) — masih ada ruang untuk ditingkatkan menuju 3.0.`);
    }
    lines.push('');

    // ── Daftar MK Bermasalah ─────────────────────────────────────────
    if (mkDetail.length > 0) {
      lines.push('📋 MATA KULIAH YANG PERLU DIPERBAIKI:');
      for (const mk of mkDetail) {
        lines.push(`• ${mk.nama} (${mk.kode}) — Nilai: ${mk.nilai} — ${mk.sks} SKS — Sem ${mk.semester}`);
      }
      lines.push('');
    }

    // ── Prediksi Jika Dibiarkan ──────────────────────────────────────
    lines.push('🔮 PREDIKSI JIKA TIDAK DITINDAKLANJUTI:');
    lines.push('• Risiko akademik dapat meningkat ke kategori TINGGI jika nilai tidak membaik.');
    if (mkBermasalah > 0) {
      lines.push(`• ${mkBermasalah} MK bermasalah yang tidak diperbaiki akan terus menurunkan IPK secara kumulatif.`);
    }
    lines.push('• Keterlambatan perbaikan dapat memperlambat laju kelulusan.\n');

    // ── Saran ────────────────────────────────────────────────────────
    lines.push('✅ SARAN PERBAIKAN:');
    lines.push('1. Targetkan IPS minimal 2.75 di semester berikutnya.');
    if (mkDetail.length > 0) {
      lines.push('2. Rencanakan pengulangan MK bermasalah di semester yang sesuai kurikulum.');
      lines.push('3. Konsultasikan dengan dosen pengampu MK bermasalah untuk strategi perbaikan.');
    }
    lines.push('4. Buat jadwal belajar terstruktur: alokasikan minimal 2 jam per hari per mata kuliah.');
    lines.push('5. Aktif dalam diskusi kelompok dan bimbingan dari kakak tingkat.');
    lines.push('6. Evaluasi manajemen waktu — hindari menumpuk tugas mendekati deadline.');

    return lines.join('\n');
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO RENDAH
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiRendah(ipk: number): string {
    const lines: string[] = [];

    lines.push('✅ STATUS RISIKO RENDAH');
    lines.push('Performa akademik Anda sangat baik! Pertahankan dan terus tingkatkan.\n');

    lines.push('🏆 PENCAPAIAN ANDA:');
    if (ipk >= 3.75) {
      lines.push(`• IPK (${ipk.toFixed(2)}) luar biasa — Anda berada di jalur cumlaude dengan predikat istimewa.`);
      lines.push('• Pertimbangkan untuk mendaftar program beasiswa unggulan, penelitian dosen, atau lomba akademik nasional.');
    } else if (ipk >= 3.5) {
      lines.push(`• IPK (${ipk.toFixed(2)}) sangat memuaskan — sudah memenuhi syarat cumlaude di sebagian besar program studi.`);
      lines.push('• Pertimbangkan mendaftar program beasiswa atau magang di perusahaan terkemuka.');
    } else if (ipk >= 3.0) {
      lines.push(`• IPK (${ipk.toFixed(2)}) sudah baik. Targetkan 3.5 untuk membuka lebih banyak peluang karir dan beasiswa.`);
    } else {
      lines.push(`• IPK (${ipk.toFixed(2)}) di zona aman. Terus tingkatkan menuju 3.0 untuk membuka peluang lebih luas.`);
    }
    lines.push('');

    lines.push('🚀 SARAN PENGEMBANGAN:');
    lines.push('1. Pertahankan konsistensi belajar yang sudah terbukti berhasil.');
    lines.push('2. Aktif dalam penelitian, seminar ilmiah, dan kegiatan akademik tambahan.');
    lines.push('3. Pertimbangkan menjadi asisten dosen atau tutor untuk MK yang dikuasai.');
    lines.push('4. Mulai membangun portofolio dan relasi profesional untuk mempersiapkan karir.');
    lines.push('5. Eksplorasi program pertukaran pelajar atau magang internasional.');

    return lines.join('\n');
  }
}
