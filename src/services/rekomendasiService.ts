export class RekomendasiService {
  static buat(
    kategori: string,
    ips: number,
    ipk: number,
    mkBermasalah: number,
    mkDetail: any[] = [],
    allKhs: any[] = [],
    semesterAktif: number = 1,
    nextSemesterCourses: any[] = []
  ): string {
    const kuotaSks = this.hitungKuotaSks(ips);
    const bakat = this.analisisBakat(allKhs);

    switch (kategori) {
      case 'Tinggi':
        return this.rekomendasiTinggi(ips, ipk, mkBermasalah, mkDetail, kuotaSks, bakat, semesterAktif, nextSemesterCourses);
      case 'Sedang':
        return this.rekomendasiSedang(ips, ipk, mkBermasalah, mkDetail, kuotaSks, bakat, semesterAktif, nextSemesterCourses);
      default:
        return this.rekomendasiRendah(ipk, ips, kuotaSks, bakat, semesterAktif, nextSemesterCourses);
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

  private static filterMKByBakat(bakat: string, courses: any[]): any[] {
    return courses.filter(mk => {
      const nama = mk.nama.toLowerCase();
      if (bakat === 'Matematika & Logika') {
        return nama.includes('kalkulus') || nama.includes('aljabar') || nama.includes('statistika') || nama.includes('matematika') || nama.includes('numerik') || nama.includes('diskrit') || nama.includes('kecerdasan') || nama.includes('bi') || nama.includes('data');
      }
      if (bakat === 'Pemrograman & Rekayasa Perangkat Lunak') {
        return nama.includes('algoritma') || nama.includes('pemrograman') || nama.includes('visual') || nama.includes('web') || nama.includes('android') || nama.includes('objek') || nama.includes('perangkat lunak');
      }
      if (bakat === 'Sistem Basis Data & Data Mining') {
        return nama.includes('basis data') || nama.includes('warehouse') || nama.includes('sistem berkas') || nama.includes('data');
      }
      if (bakat === 'Infrastruktur & Jaringan Komputer') {
        return nama.includes('jaringan') || nama.includes('arsitektur') || nama.includes('mikroprosesor') || nama.includes('sistem operasi') || nama.includes('lanjutan');
      }
      if (bakat === 'Multimedia & UI/UX') {
        return nama.includes('grafika') || nama.includes('multimedia') || nama.includes('interaksi') || nama.includes('ui/ux');
      }
      return false;
    });
  }

  private static renderSaranBakat(bakat: string[], nextSemesterCourses: any[], semesterAktif: number): string[] {
    const lines = [];
    if (bakat.length > 0) {
      lines.push('🎯 REKOMENDASI MATA KULIAH SPESIFIK BERBASIS MINAT:');
      lines.push(`Sistem mendeteksi bahwa Anda unggul (nilai A/B) pada bidang: **${bakat.join('** dan **')}**.`);
      
      bakat.forEach(b => {
        const matchingMK = this.filterMKByBakat(b, nextSemesterCourses);
        const mkNames = matchingMK.map(m => m.nama);
        
        let saranText = '';
        if (b === 'Matematika & Logika') saranText = 'karena nilai Anda di semester sebelumnya tinggi pada perhitungan/analitik.';
        if (b === 'Pemrograman & Rekayasa Perangkat Lunak') saranText = 'karena nilai Anda di semester sebelumnya tinggi pada pelajaran pemrograman/software.';
        if (b === 'Sistem Basis Data & Data Mining') saranText = 'karena keunggulan Anda di bidang analisis dan pengolahan data.';
        if (b === 'Infrastruktur & Jaringan Komputer') saranText = 'karena nilai Anda tinggi pada mata kuliah infrastruktur dan perangkat keras/jaringan.';
        if (b === 'Multimedia & UI/UX') saranText = 'mengingat kreativitas Anda di bidang visual dan multimedia.';

        if (mkNames.length > 0) {
          lines.push(`• Pada Semester ${semesterAktif + 1}, sebaiknya Anda mengambil mata kuliah **${mkNames.join(', ')}** ${saranText}`);
        } else {
          // Fallback if no specific course found for next semester
          lines.push(`• Sangat disarankan untuk berfokus/mengambil peminatan yang berhubungan dengan **${b}** ${saranText}`);
        }
      });
      lines.push('');
    }
    return lines;
  }

  // ────────────────────────────────────────────────────────────────────────
  // RISIKO TINGGI
  // ────────────────────────────────────────────────────────────────────────
  private static rekomendasiTinggi(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[], kuotaSks: number, bakat: string[], semesterAktif: number, nextSemesterCourses: any[]): string {
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
    lines.push(...this.renderSaranBakat(bakat, nextSemesterCourses, semesterAktif));

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
  private static rekomendasiSedang(ips: number, ipk: number, mkBermasalah: number, mkDetail: any[], kuotaSks: number, bakat: string[], semesterAktif: number, nextSemesterCourses: any[]): string {
    const lines: string[] = [];
    lines.push('⚠️ STATUS RISIKO SEDANG');
    lines.push('Performa Anda memerlukan perhatian. Dengan strategi SKS yang tepat, risiko ini bisa ditekan.\n');

    lines.push('📊 ANALISIS NILAI SAAT INI:');
    if (ips < 2.5) lines.push(`• IPS Anda (${ips.toFixed(2)}) di bawah rata-rata ideal (2.5).`);
    else lines.push(`• IPS Anda (${ips.toFixed(2)}) sudah cukup aman.`);
    if (ipk < 3.0) lines.push(`• IPK kumulatif (${ipk.toFixed(2)}) — masih ada ruang untuk ditingkatkan menuju 3.0.`);
    lines.push('');

    lines.push(...this.renderSaranPengambilan(kuotaSks, semesterAktif, mkBermasalah));
    lines.push(...this.renderSaranBakat(bakat, nextSemesterCourses, semesterAktif));

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
  private static rekomendasiRendah(ipk: number, ips: number, kuotaSks: number, bakat: string[], semesterAktif: number, nextSemesterCourses: any[]): string {
    const lines: string[] = [];
    lines.push('✅ STATUS RISIKO RENDAH');
    lines.push('Performa akademik Anda sangat baik! Pertahankan dan susun strategi akselerasi lulus cepat.\n');

    lines.push(...this.renderSaranPengambilan(kuotaSks, semesterAktif, 0));
    lines.push(...this.renderSaranBakat(bakat, nextSemesterCourses, semesterAktif));

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
