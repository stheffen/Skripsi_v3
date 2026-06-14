// ========================================================
// FUNGSI KEANGGOTAAN (Membership Functions)
// ========================================================

function trapezoidLeft(x: number, a: number, b: number): number {
  if (x <= a) return 1.0;
  if (x >= b) return 0.0;
  return (b - x) / (b - a);
}

function trapezoidRight(x: number, a: number, b: number): number {
  if (x <= a) return 0.0;
  if (x >= b) return 1.0;
  return (x - a) / (b - a);
}

function triangle(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0.0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

function trapezoid(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0.0;
  if (x >= b && x <= c) return 1.0;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

// ========================================================
// FUZZIFIKASI
// ========================================================

export function fuzzifikasiIPS(ips: number) {
  return {
    rendah: trapezoidLeft(ips, 1.99, 2.00),
    sedang: trapezoid(ips, 1.99, 2.00, 2.49, 2.50),
    tinggi: trapezoidRight(ips, 2.49, 2.50),
  };
}

export function fuzzifikasiIPK(ipk: number) {
  return {
    rendah: trapezoidLeft(ipk, 1.99, 2.00),
    sedang: trapezoid(ipk, 1.99, 2.00, 2.49, 2.50),
    tinggi: trapezoidRight(ipk, 2.49, 2.50),
  };
}

export function fuzzifikasiMKBermasalah(mk: number) {
  return {
    sedikit: trapezoidLeft(mk, 1.0, 3.0),
    sedang: triangle(mk, 1.0, 4.0, 7.0),
    banyak: trapezoidRight(mk, 5.0, 8.0),
  };
}

// ========================================================
// INFERENSI MAMDANI -- 27 ATURAN (Angkatan < 2026)
// ========================================================
export function inferensi(
  muIPS: ReturnType<typeof fuzzifikasiIPS>,
  muIPK: ReturnType<typeof fuzzifikasiIPK>,
  muMK: ReturnType<typeof fuzzifikasiMKBermasalah>
) {
  const rules = [
    { ips: 'rendah', ipk: 'rendah', mk: 'banyak',  output: 'tinggi' },
    { ips: 'rendah', ipk: 'rendah', mk: 'sedang',  output: 'tinggi' },
    { ips: 'rendah', ipk: 'rendah', mk: 'sedikit', output: 'tinggi' },
    { ips: 'rendah', ipk: 'sedang', mk: 'banyak',  output: 'tinggi' },
    { ips: 'rendah', ipk: 'sedang', mk: 'sedang',  output: 'sedang' },
    { ips: 'rendah', ipk: 'sedang', mk: 'sedikit', output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', mk: 'banyak',  output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', mk: 'sedang',  output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
    { ips: 'sedang', ipk: 'rendah', mk: 'banyak',  output: 'tinggi' },
    { ips: 'sedang', ipk: 'rendah', mk: 'sedang',  output: 'sedang' },
    { ips: 'sedang', ipk: 'rendah', mk: 'sedikit', output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', mk: 'banyak',  output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', mk: 'sedang',  output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', mk: 'sedikit', output: 'rendah' },
    { ips: 'sedang', ipk: 'tinggi', mk: 'banyak',  output: 'sedang' },
    { ips: 'sedang', ipk: 'tinggi', mk: 'sedang',  output: 'rendah' },
    { ips: 'sedang', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
    { ips: 'tinggi', ipk: 'rendah', mk: 'banyak',  output: 'sedang' },
    { ips: 'tinggi', ipk: 'rendah', mk: 'sedang',  output: 'sedang' },
    { ips: 'tinggi', ipk: 'rendah', mk: 'sedikit', output: 'rendah' },
    { ips: 'tinggi', ipk: 'sedang', mk: 'banyak',  output: 'sedang' },
    { ips: 'tinggi', ipk: 'sedang', mk: 'sedang',  output: 'rendah' },
    { ips: 'tinggi', ipk: 'sedang', mk: 'sedikit', output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', mk: 'banyak',  output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', mk: 'sedang',  output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
  ] as const;

  let outputRendah = 0.0, outputSedang = 0.0, outputTinggi = 0.0;
  const rulesAktif: any[] = [];

  rules.forEach((rule, idx) => {
    const alpha = Math.min(muIPS[rule.ips], muIPK[rule.ipk], muMK[rule.mk]);
    if (alpha > 0) rulesAktif.push({ rule: idx + 1, ips: rule.ips, ipk: rule.ipk, mk: rule.mk, output: rule.output, alpha: Number(alpha.toFixed(4)) });
    switch (rule.output) {
      case 'rendah': outputRendah = Math.max(outputRendah, alpha); break;
      case 'sedang': outputSedang = Math.max(outputSedang, alpha); break;
      case 'tinggi': outputTinggi = Math.max(outputTinggi, alpha); break;
    }
  });

  return { rendah: outputRendah, sedang: outputSedang, tinggi: outputTinggi, rules_aktif: rulesAktif };
}

// ========================================================
// INFERENSI MAMDANI -- 9 ATURAN (Angkatan >= 2026)
// Memasukkan Penalti Sisa Beban Studi (Mendekati Semester 8)
// ========================================================
export function inferensiBaru(
  muIPS: ReturnType<typeof fuzzifikasiIPS>,
  muIPK: ReturnType<typeof fuzzifikasiIPK>,
  mkBermasalah: number,
  semesterAktif: number,
  sisaSks: number
) {
  const rules = [
    { ips: 'rendah', ipk: 'rendah', output: 'tinggi' },
    { ips: 'rendah', ipk: 'sedang', output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', output: 'sedang' },
    { ips: 'sedang', ipk: 'rendah', output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', output: 'rendah' },
    { ips: 'sedang', ipk: 'tinggi', output: 'rendah' },
    { ips: 'tinggi', ipk: 'rendah', output: 'sedang' },
    { ips: 'tinggi', ipk: 'sedang', output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', output: 'rendah' },
  ] as const;

  // Hitung Penalti Beban Studi
  let penalty = 0;
  
  // Penalty 1: Melewati masa studi normal (Semester 9+) pasti penalti berat
  if (semesterAktif > 8) penalty += 1.5;

  // Penalty 2: Sisa SKS vs Waktu Ideal (Asumsi maksimal ambil 24 SKS per semester)
  // Berapa maksimal SKS yang logis bisa diselesaikan hingga semester 8?
  const sisaSemesterKe8 = Math.max(0, 9 - semesterAktif);
  const maxSksBisaDitempuhLulusNormal = sisaSemesterKe8 * 24; 
  
  // Jika sisa SKS > dari yang bisa ditempuh sampai sem 8, PASTI molor
  if (sisaSks > maxSksBisaDitempuhLulusNormal) {
    penalty += 1.5; 
  } else if (sisaSks > maxSksBisaDitempuhLulusNormal - 10 && semesterAktif >= 6) {
    // Sangat mepet (misal di sem 7 sisa 40 SKS, batas 48, maka sisaSks > 38)
    penalty += 0.5;
  }

  // Penalty 3: Masih ada / banyak MK Bermasalah (D/E)
  if (mkBermasalah >= 3) penalty += 1.0;
  else if (mkBermasalah > 0) penalty += 0.5;

  // Penalty 4: IPS Jelek di saat genting (Mulai Semester 6 ke atas)
  if (semesterAktif >= 6 && muIPS.rendah > 0.4) penalty += 0.5;

  const eskalasi = (out: string): string => {
    if (penalty >= 1.5) {
      // Sangat berisiko molor
      return 'tinggi';
    }
    if (penalty >= 0.5) {
      if (out === 'rendah') return 'sedang';
      if (out === 'sedang') return 'tinggi';
      return 'tinggi';
    }
    return out;
  };

  let outputRendah = 0.0, outputSedang = 0.0, outputTinggi = 0.0;
  const rulesAktif: any[] = [];

  rules.forEach((rule, idx) => {
    const alpha = Math.min(muIPS[rule.ips], muIPK[rule.ipk]);
    const finalOutput = eskalasi(rule.output);
    if (alpha > 0) {
      rulesAktif.push({ 
        rule: idx + 1, 
        ips: rule.ips, 
        ipk: rule.ipk, 
        info_penalti: `Penalti: ${penalty}`, 
        output: finalOutput, 
        alpha: Number(alpha.toFixed(4)) 
      });
    }
    switch (finalOutput) {
      case 'rendah': outputRendah = Math.max(outputRendah, alpha); break;
      case 'sedang': outputSedang = Math.max(outputSedang, alpha); break;
      case 'tinggi': outputTinggi = Math.max(outputTinggi, alpha); break;
    }
  });

  return { rendah: outputRendah, sedang: outputSedang, tinggi: outputTinggi, rules_aktif: rulesAktif, penalty_score: penalty };
}

// ========================================================
// DEFUZZIFIKASI - Centroid of Gravity (COG)
// ========================================================
export function defuzzifikasi(outputFuzzy: { rendah: number; sedang: number; tinggi: number }): number {
  let numerator = 0.0, denominator = 0.0;
  const steps = 200;
  const { rendah: muRendah, sedang: muSedang, tinggi: muTinggi } = outputFuzzy;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const mu = Math.max(
      Math.min(muRendah, trapezoidLeft(x, 20.0, 40.0)),
      Math.min(muSedang, trapezoid(x, 25.0, 40.0, 60.0, 75.0)),
      Math.min(muTinggi, trapezoidRight(x, 60.0, 80.0))
    );
    numerator += x * mu;
    denominator += mu;
  }

  if (denominator <= 0) return 0.0;
  return Number((numerator / denominator).toFixed(2));
}

// ========================================================
// KLASIFIKASI BERDASARKAN CRISP OUTPUT
// ========================================================
export function klasifikasi(crispOutput: number): string {
  if (crispOutput < 35) return 'Rendah';
  if (crispOutput < 65) return 'Sedang';
  return 'Tinggi';
}

// ========================================================
// PROSES LENGKAP FUZZY MAMDANI
// angkatan >= 2026 -> 9 aturan + penalti; angkatan < 2026 -> 27 aturan
// ========================================================
export function prosesFuzzy(ips: number, ipk: number, mkBermasalah: number, angkatan?: number | null, semesterAktif: number = 1, sisaSks: number = 144) {
  const muIPS = fuzzifikasiIPS(ips);
  const muIPK = fuzzifikasiIPK(ipk);

  const tahunAngkatan = angkatan ? parseInt(String(angkatan)) : 0;
  const gunakanAturanBaru = tahunAngkatan >= 2026;

  let output;
  let fuzzMK = null;
  const totalRules = gunakanAturanBaru ? 9 : 27;

  if (gunakanAturanBaru) {
    output = inferensiBaru(muIPS, muIPK, mkBermasalah, semesterAktif, sisaSks);
  } else {
    const muMK = fuzzifikasiMKBermasalah(mkBermasalah);
    fuzzMK = muMK;
    output = inferensi(muIPS, muIPK, muMK);
  }

  const crispOutput = defuzzifikasi(output);
  const kategori = klasifikasi(crispOutput);

  return {
    input: { ips, ipk, mk_bermasalah: mkBermasalah, semester_aktif: semesterAktif, sisa_sks: sisaSks },
    fuzzifikasi: {
      ips: muIPS,
      ipk: muIPK,
      mk: fuzzMK ?? { sedikit: 0, sedang: 0, banyak: 0 },
    },
    inferensi: { rendah: output.rendah, sedang: output.sedang, tinggi: output.tinggi },
    rules_aktif: output.rules_aktif,
    total_rules: totalRules,
    angkatan_mode: gunakanAturanBaru ? 'baru_9_aturan' : 'lama_27_aturan',
    crisp_output: crispOutput,
    kategori,
  };
}
