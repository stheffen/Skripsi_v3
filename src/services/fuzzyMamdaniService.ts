// ========================================================
// FUNGSI KEANGGOTAAN (Membership Functions)
// ========================================================

/**
 * Trapezoid membership function
 * Untuk nilai yang lebih rendah (turun di kanan)
 */
function trapezoidLeft(x: number, a: number, b: number): number {
  if (x <= a) return 1.0;
  if (x >= b) return 0.0;
  return (b - x) / (b - a);
}

/**
 * Trapezoid membership function
 * Untuk nilai yang lebih tinggi (naik di kiri)
 */
function trapezoidRight(x: number, a: number, b: number): number {
  if (x <= a) return 0.0;
  if (x >= b) return 1.0;
  return (x - a) / (b - a);
}

/**
 * Triangle membership function
 */
function triangle(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0.0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/**
 * Trapezoid (4 point) membership function
 */
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
    rendah: trapezoidLeft(ips, 1.5, 2.0),
    sedang: triangle(ips, 1.5, 2.5, 3.0),
    tinggi: trapezoidRight(ips, 2.5, 3.5),
  };
}

export function fuzzifikasiIPK(ipk: number) {
  return {
    rendah: trapezoidLeft(ipk, 1.5, 2.0),
    sedang: triangle(ipk, 1.5, 2.5, 3.0),
    tinggi: trapezoidRight(ipk, 2.5, 3.5),
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
// INFERENSI MAMDANI
// ========================================================
export function inferensi(
  muIPS: ReturnType<typeof fuzzifikasiIPS>,
  muIPK: ReturnType<typeof fuzzifikasiIPK>,
  muMK: ReturnType<typeof fuzzifikasiMKBermasalah>
) {
  const rules = [
    // R1-R3: IPS Rendah + IPK Rendah
    { ips: 'rendah', ipk: 'rendah', mk: 'banyak', output: 'tinggi' },
    { ips: 'rendah', ipk: 'rendah', mk: 'sedang', output: 'tinggi' },
    { ips: 'rendah', ipk: 'rendah', mk: 'sedikit', output: 'tinggi' },
    // R4-R6: IPS Rendah + IPK Sedang
    { ips: 'rendah', ipk: 'sedang', mk: 'banyak', output: 'tinggi' },
    { ips: 'rendah', ipk: 'sedang', mk: 'sedang', output: 'sedang' },
    { ips: 'rendah', ipk: 'sedang', mk: 'sedikit', output: 'sedang' },
    // R7-R9: IPS Rendah + IPK Tinggi
    { ips: 'rendah', ipk: 'tinggi', mk: 'banyak', output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', mk: 'sedang', output: 'sedang' },
    { ips: 'rendah', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
    // R10-R12: IPS Sedang + IPK Rendah
    { ips: 'sedang', ipk: 'rendah', mk: 'banyak', output: 'tinggi' },
    { ips: 'sedang', ipk: 'rendah', mk: 'sedang', output: 'sedang' },
    { ips: 'sedang', ipk: 'rendah', mk: 'sedikit', output: 'sedang' },
    // R13-R15: IPS Sedang + IPK Sedang
    { ips: 'sedang', ipk: 'sedang', mk: 'banyak', output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', mk: 'sedang', output: 'sedang' },
    { ips: 'sedang', ipk: 'sedang', mk: 'sedikit', output: 'rendah' },
    // R16-R18: IPS Sedang + IPK Tinggi
    { ips: 'sedang', ipk: 'tinggi', mk: 'banyak', output: 'sedang' },
    { ips: 'sedang', ipk: 'tinggi', mk: 'sedang', output: 'rendah' },
    { ips: 'sedang', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
    // R19-R21: IPS Tinggi + IPK Rendah
    { ips: 'tinggi', ipk: 'rendah', mk: 'banyak', output: 'sedang' },
    { ips: 'tinggi', ipk: 'rendah', mk: 'sedang', output: 'sedang' },
    { ips: 'tinggi', ipk: 'rendah', mk: 'sedikit', output: 'rendah' },
    // R22-R24: IPS Tinggi + IPK Sedang
    { ips: 'tinggi', ipk: 'sedang', mk: 'banyak', output: 'sedang' },
    { ips: 'tinggi', ipk: 'sedang', mk: 'sedang', output: 'rendah' },
    { ips: 'tinggi', ipk: 'sedang', mk: 'sedikit', output: 'rendah' },
    // R25-R27: IPS Tinggi + IPK Tinggi
    { ips: 'tinggi', ipk: 'tinggi', mk: 'banyak', output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', mk: 'sedang', output: 'rendah' },
    { ips: 'tinggi', ipk: 'tinggi', mk: 'sedikit', output: 'rendah' },
  ] as const;

  let outputRendah = 0.0;
  let outputSedang = 0.0;
  let outputTinggi = 0.0;
  const rulesAktif: any[] = [];

  rules.forEach((rule, idx) => {
    const alpha = Math.min(
      muIPS[rule.ips],
      muIPK[rule.ipk],
      muMK[rule.mk]
    );

    if (alpha > 0) {
      rulesAktif.push({
        rule: idx + 1,
        ips: rule.ips,
        ipk: rule.ipk,
        mk: rule.mk,
        output: rule.output,
        alpha: Number(alpha.toFixed(4)),
      });
    }

    switch (rule.output) {
      case 'rendah':
        outputRendah = Math.max(outputRendah, alpha);
        break;
      case 'sedang':
        outputSedang = Math.max(outputSedang, alpha);
        break;
      case 'tinggi':
        outputTinggi = Math.max(outputTinggi, alpha);
        break;
    }
  });

  return {
    rendah: outputRendah,
    sedang: outputSedang,
    tinggi: outputTinggi,
    rules_aktif: rulesAktif,
  };
}

// ========================================================
// DEFUZZIFIKASI - Centroid of Gravity (COG)
// ========================================================
export function defuzzifikasi(outputFuzzy: { rendah: number; sedang: number; tinggi: number }): number {
  const muRendah = outputFuzzy.rendah;
  const muSedang = outputFuzzy.sedang;
  const muTinggi = outputFuzzy.tinggi;

  let numerator = 0.0;
  let denominator = 0.0;
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;

    const clipRendah = Math.min(muRendah, trapezoidLeft(x, 20.0, 40.0));
    const clipSedang = Math.min(muSedang, trapezoid(x, 25.0, 40.0, 60.0, 75.0));
    const clipTinggi = Math.min(muTinggi, trapezoidRight(x, 60.0, 80.0));

    const mu = Math.max(clipRendah, clipSedang, clipTinggi);

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
// ========================================================
export function prosesFuzzy(ips: number, ipk: number, mkBermasalah: number) {
  const muIPS = fuzzifikasiIPS(ips);
  const muIPK = fuzzifikasiIPK(ipk);
  const muMK = fuzzifikasiMKBermasalah(mkBermasalah);

  const output = inferensi(muIPS, muIPK, muMK);
  const crispOutput = defuzzifikasi(output);
  const kategori = klasifikasi(crispOutput);

  return {
    input: {
      ips,
      ipk,
      mk_bermasalah: mkBermasalah,
    },
    fuzzifikasi: {
      ips: muIPS,
      ipk: muIPK,
      mk: muMK,
    },
    inferensi: {
      rendah: output.rendah,
      sedang: output.sedang,
      tinggi: output.tinggi,
    },
    rules_aktif: output.rules_aktif,
    crisp_output: crispOutput,
    kategori,
  };
}
