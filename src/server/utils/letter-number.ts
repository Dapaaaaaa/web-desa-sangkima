// Penghasil nomor surat resmi desa.
// Format: 470/{urut 3 digit}/DS-SKM/{bulan romawi}/{tahun}
// Contoh: 470/012/DS-SKM/VI/2026
const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export function formatLetterNumber(sequence: number, date: Date = new Date()) {
  const seq = String(sequence).padStart(3, "0");
  const month = ROMAN_MONTHS[date.getMonth()];
  return `470/${seq}/DS-SKM/${month}/${date.getFullYear()}`;
}
