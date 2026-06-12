export class RekomendasiService {
  static buat(
    kategori: string,
    ips: number,
    ipk: number,
    mkBermasalah: number,
    mkDetail: any[] = [],
    allKhs: any[] = [],
    semesterAktif: number = 1
  ): string {
    const kuotaSks = this.hitungKuotaSks(ips);
    const bakat = this.analisisBakat(allKhs);

    switch (kategori) {
      case 'Tinggi':
        return this.rekomendasiTinggi(ips, ipk, mkBermasalah, mkDetail, kuotaSks, bakat, semesterAktif);
      case 'Sedang':
        return this.rekomendasiSedang(ips, ipk, mkBermasalah, mkDetail, kuotaSks, bakat, semesterAktif);
      default:
        return this.rekomendasiRendah(ipk, ips, kuotaSks, bakat, semesterAktif);
    }
  }

  private static hitungKuotaSks(ips: number): number {
    if (ips >= 3.0) return 24;
    if (ips >= 2.5) return 21;
    if (ips >= 2.0) return 18;
    return 15;
  }

  private static analisisBakat(allKhs: any[]): string[] {
    const nilaiTinggi = allKhs.filter(k => k.nilai === 'A' || k.nilai === 'B');
    if (nilaiTinggi.length === 0) return [];

    const kategoriSkor: Record<string, number> = {
      'Matematika & Logika': 0,
      'Pemrograman & Rekayasa Perangkat Lunak': 0,
      'Sistem Basis Data & Data Mining': 0,
      'Infrastruktur & Jaringan Komputer': 0,
      'Multimedia & UI/UX': 0
    };

    nilaiTinggi.forEach(k => {
      const nama = k.mata_kuliah?.nama?.toLowerCase() || '';
      const bobot = k.nilai === 'A' ? 2 : 1;

      if (nama.includes('kalkulus') || nama.includes('aljabar') || nama.includes('statistika') || nama.includes('matematika') || nama.includes('numerik') || nama.includes('diskrit')) {
        kategoriSkor['Matematika & Logika'] += bobot;
      }
      if (nama.includes('algoritma') || nama.includes('pemrograman') || nama.includes('visual') || nama.includes('web') || nama.includes('android') || nama.includes('objek') || nama.includes('perangkat lunak')) {
        kategoriSkor['Pemrograman & Rekayasa Perangkat Lunak'] += bobot;
      }
      if (nama.includes('basis data') || nama.includes('warehouse') || nama.includes('sistem berkas') || nama.includes('data')) {
        kategoriSkor['Sistem Basis Data & Data Mining'] += bobot;
      }
      if (nama.includes('jaringan') || nama.includes('arsitektur') || nama.includes('mikroprosesor') || nama.includes('sistem operasi')) {
        kategoriSkor['Infrastruktur & Jaringan Komputer'] += bobot;
      }
      if (nama.includes('grafika') || nama.includes('multimedia') || nama.includes('interaksi') || nama.includes('ui/ux')) {
        kategoriSkor['Multimedia & UI/UX'] += bobot;
      }
    });

    // Ambil top 2 kategori dengan skor > 0
    return Object.entries(kategoriSkor)
      .filter(([_, skor]) => skor > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([kategori]) => kategori);
  }

  private static renderSaranPengambilan(kuotaSks: number, semesterAktif: number, mkBermasalah: number): string[] {
    const lines = [];
    lines.push('📋 STRATEGI PENGAMBILAN SKS SEMESTER DEPAN:');
    lines.push(`• Berdasarkan IPS Anda, Anda berhak mengambil maksimal **${kuotaSks} SKS** di Semester ${semesterAktif + 1}.`);
    
    if (mkBermasalah > 0) {
      lines.push('• **Saran Prioritas (Sistem Pakar):** Sebaiknya prioritaskan mengambil mata kuliah BARU di semester selanjutnya terlebih dahulu untuk mengejar kurikulum utama.');
      lines.push('• Setelah mata kuliah baru terpenuhi, gunakan *sisa kuota SKS* Anda untuk mengulang mata kuliah yang mendapat nilai D atau E.');
      lines.push('• Pengecualian: Jika mata kuliah yang mendapat nilai E adalah prasyarat untuk mata kuliah selanjutnya, maka mata kuliah tersebut wajib diulang terlebih dahulu.');
    } else {
      lines.push('• Anda dapat mengambil mata kuliah baru di semester selanjutnya secara maksimal sesuai paket kurikulum yang tersedia.');
    }
    lines.push('');
    return lines;
  }

  private static renderSaranBakat(bakat: string[]): string[] {
    const lines = [];
    if (bakat.length > 0) {
      lines.push('🎯 REKOMENDASI BERBASIS MINAT & BAKAT:');
      lines.push(`Sistem mendeteksi bahwa Anda sangat unggul (nilai A/B) pada kelompok mata kuliah: **${bakat.join('** dan **')}**.`);
      
      bakat.forEach(b => {
        if (b === 'Matematika & Logika') lines.push('• Karena keunggulan Anda di **Logika/Matematika**, kami menyarankan Anda mengambil mata kuliah tingkat lanjut seperti **Kecerdasan Buatan** atau konsentrasi analisis data.');
        if (b === 'Pemrograman & Rekayasa Perangkat Lunak') lines.push('• Karena Anda jago di **Pemrograman**, sangat disarankan untuk berfokus mengambil **Pemrograman Web**, **Pemrograman Android**, atau **Rekayasa Perangkat Lunak** sebagai topik utama skripsi/proyek Anda.');
        if (b === 'Sistem Basis Data & Data Mining') lines.push('• Karena Anda kuat di **Basis Data**, pertimbangkan untuk mendalami konsentrasi **Data Mining & Warehouse** atau Manajemen Basis Data tingkat lanjut.');
        if (b === 'Infrastruktur & Jaringan Komputer') lines.push('• Karena keahlian Anda di bidang **Infrastruktur/Sistem**, kami merekomendasikan Anda mengambil **Jaringan Komputer Lanjutan** atau Keamanan Cyber.');
        if (b === 'Multimedia & UI/UX') lines.push('• Karena kreativitas Anda di **Multimedia**, disarankan untuk mengambil **Sistem Multimedia** dan berfokus pada desain UI/UX di mata kuliah Interaksi Manusia dan Komputer.');
      });
      lines.push('');
    }
    return lines;
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO TINGGI
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiTinggi(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[], kuotaSks: number, bakat: string[], semesterAktif: number): string {
    const lines: string[] = [];
    lines.push('🚨 STATUS RISIKO TINGGI');
    lines.push('Kondisi akademik Anda memerlukan tindakan segera. Jangan tunda konsultasi dengan Dosen Pembimbing Akademik (DPA).\n');

    lines.push('📊 ANALISIS NILAI SAAT INI:');
    if (ips < 1.5) lines.push(`• IPS Anda (${ips.toFixed(2)}) sangat kritis — di bawah 1.5.`);
    else if (ips < 2.0) lines.push(`• IPS Anda (${ips.toFixed(2)}) di bawah batas minimum (2.0).`);
    else lines.push(`• IPS Anda (${ips.toFixed(2)}) cukup namun kombinasi faktor menempatkan di risiko tinggi.`);
    
    if (ipk < 2.0) lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) di bawah 2.0 — batas minimum kelulusan.`);
    else lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) masih perlu ditingkatkan.`);
    lines.push('');

    lines.push(...this.renderSaranPengambilan(kuotaSks, semesterAktif, mkBermasalah));
    lines.push(...this.renderSaranBakat(bakat));

    if (mkDetail.length > 0) {
      lines.push('❌ MATA KULIAH YANG PERLU PERHATIAN (D/E):');
      for (const mk of mkDetail) {
        const prioritas = mk.nilai === 'E' ? '[PRIORITAS UTAMA]' : '[Perlu Diulang]';
        lines.push(`• ${prioritas} ${mk.nama} (${mk.kode}) — Nilai: ${mk.nilai} — ${mk.sks} SKS — Sem ${mk.semester}`);
      }
      lines.push('');
    }

    lines.push('✅ RENCANA AKSI SEGERA:');
    lines.push('1. Buat jadwal konsultasi dengan DPA dalam 1 minggu ke depan.');
    lines.push('2. Targetkan IPS minimal 2.0 di semester berikutnya untuk menghindari Drop Out (DO).');
    lines.push('3. Tingkatkan kehadiran kelas minimal 80%.');
    return lines.join('\n');
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO SEDANG
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiSedang(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[], kuotaSks: number, bakat: string[], semesterAktif: number): string {
    const lines: string[] = [];
    lines.push('⚠️ STATUS RISIKO SEDANG');
    lines.push('Performa Anda memerlukan perhatian. Dengan strategi SKS yang tepat, risiko ini bisa ditekan.\n');

    lines.push('📊 ANALISIS NILAI SAAT INI:');
    if (ips < 2.5) lines.push(`• IPS Anda (${ips.toFixed(2)}) di bawah rata-rata ideal (2.5).`);
    else lines.push(`• IPS Anda (${ips.toFixed(2)}) sudah cukup aman.`);
    if (ipk < 3.0) lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) — masih ada ruang untuk ditingkatkan menuju 3.0.`);
    lines.push('');

    lines.push(...this.renderSaranPengambilan(kuotaSks, semesterAktif, mkBermasalah));
    lines.push(...this.renderSaranBakat(bakat));

    if (mkDetail.length > 0) {
      lines.push('📋 MATA KULIAH YANG PERLU DIPERBAIKI (D/E):');
      for (const mk of mkDetail) {
        lines.push(`• ${mk.nama} (${mk.kode}) — Nilai: ${mk.nilai} — ${mk.sks} SKS — Sem ${mk.semester}`);
      }
      lines.push('');
    }

    lines.push('✅ SARAN PERBAIKAN:');
    lines.push('1. Targetkan IPS minimal 2.75 di semester berikutnya agar kuota SKS meningkat.');
    lines.push('2. Fokuskan waktu belajar ekstra pada kelemahan Anda, namun manfaatkan kelebihan Anda (berdasarkan rekomendasi di atas) untuk menyeimbangkan nilai.');
    return lines.join('\n');
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO RENDAH
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiRendah(ipk: number, ips: number, kuotaSks: number, bakat: string[], semesterAktif: number): string {
    const lines: string[] = [];
    lines.push('✅ STATUS RISIKO RENDAH');
    lines.push('Performa akademik Anda sangat baik! Pertahankan dan susun strategi akselerasi lulus cepat.\n');

    lines.push(...this.renderSaranPengambilan(kuotaSks, semesterAktif, 0));
    lines.push(...this.renderSaranBakat(bakat));

    lines.push('🏆 PENCAPAIAN ANDA:');
    if (ipk >= 3.75) lines.push(`• IPK (${ipk.toFixed(2)}) luar biasa — jalur cumlaude predikat istimewa.`);
    else if (ipk >= 3.5) lines.push(`• IPK (${ipk.toFixed(2)}) sangat memuaskan — aman untuk syarat cumlaude.`);
    else lines.push(`• IPK (${ipk.toFixed(2)}) sudah sangat stabil.`);
    lines.push('');

    lines.push('🚀 SARAN PENGEMBANGAN:');
    lines.push('1. Gunakan jatah maksimal 24 SKS Anda sebaik mungkin untuk mengambil mata kuliah atas (Akselerasi).');
    lines.push('2. Pertimbangkan untuk mendaftar program beasiswa atau magang bersertifikat MBKM.');
    lines.push('3. Jadilah asisten dosen atau tutor sebaya untuk memantapkan pemahaman dasar Anda.');
    return lines.join('\n');
  }
}
