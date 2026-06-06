import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { letterTypes } from "./schema";
import type { TCreateLetterTypeInput } from "../types/letter";

// 6 jenis surat MVP Desa Sangkima.
// Jalankan dengan: npx tsx src/server/db/seed.ts
const SEED_LETTER_TYPES: TCreateLetterTypeInput[] = [
  {
    code: "SKD",
    name: "Surat Keterangan Domisili",
    description: "Keterangan bahwa warga berdomisili di Desa Sangkima.",
    template:
      "Yang bertanda tangan di bawah ini menerangkan bahwa {{name}} (NIK {{nik}}) benar berdomisili di {{address}}.",
    requiredFields: [],
    active: true,
  },
  {
    code: "SKTM",
    name: "Surat Keterangan Tidak Mampu",
    description: "Keterangan tidak mampu untuk syarat bantuan/keringanan biaya.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) tergolong keluarga tidak mampu, untuk keperluan {{purpose}}.",
    requiredFields: [],
    active: true,
  },
  {
    code: "SKU",
    name: "Surat Keterangan Usaha",
    description: "Keterangan kepemilikan usaha milik warga.",
    template:
      "Menerangkan bahwa {{name}} memiliki usaha {{namaUsaha}} ({{jenisUsaha}}) beralamat di {{alamatUsaha}}.",
    requiredFields: [
      { name: "namaUsaha", label: "Nama Usaha", type: "text", required: true },
      {
        name: "jenisUsaha",
        label: "Jenis Usaha",
        type: "text",
        required: true,
      },
      {
        name: "alamatUsaha",
        label: "Alamat Usaha",
        type: "text",
        required: true,
      },
    ],
    active: true,
  },
  {
    code: "SKBM",
    name: "Surat Keterangan Belum Menikah",
    description: "Keterangan status belum menikah.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) sampai saat ini berstatus belum menikah.",
    requiredFields: [],
    active: true,
  },
  {
    code: "SP",
    name: "Surat Pengantar",
    description: "Surat pengantar umum ke instansi lain.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) adalah benar warga Desa Sangkima, untuk keperluan {{purpose}}{{#tujuanInstansi}} di {{tujuanInstansi}}{{/tujuanInstansi}}.",
    requiredFields: [
      {
        name: "tujuanInstansi",
        label: "Tujuan Instansi",
        type: "text",
        required: false,
        placeholder: "mis. Kantor Kecamatan / Kepolisian",
      },
    ],
    active: true,
  },
  {
    code: "SKP",
    name: "Surat Keterangan Penghasilan",
    description: "Keterangan penghasilan untuk syarat beasiswa/kredit.",
    template:
      "Menerangkan bahwa {{name}} memiliki penghasilan rata-rata Rp {{penghasilan}} per bulan.",
    requiredFields: [
      {
        name: "penghasilan",
        label: "Penghasilan per Bulan (Rp)",
        type: "number",
        required: true,
      },
    ],
    active: true,
  },
];

async function seed() {
  console.log("🌱 Menyemai jenis surat...");

  for (const item of SEED_LETTER_TYPES) {
    const existing = await db
      .select()
      .from(letterTypes)
      .where(eq(letterTypes.code, item.code))
      .limit(1);

    if (existing[0]) {
      console.log(`⏭️  ${item.code} sudah ada, dilewati`);
      continue;
    }

    await db.insert(letterTypes).values(item);
    console.log(`✅ ${item.code} — ${item.name}`);
  }

  console.log("Selesai.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Gagal seed:", err);
  process.exit(1);
});
