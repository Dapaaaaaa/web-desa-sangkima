import { letterRequestService } from "@/server/services/letterRequest.service";

type PageProps = { params: Promise<{ code: string }> };

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggal(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

// Halaman publik (tanpa login) untuk verifikasi keaslian surat via QR.
// Tampilan sederhana — boleh dipercantik tim Frontend.
export default async function VerifikasiPage({ params }: PageProps) {
  const { code } = await params;
  const result = await letterRequestService.verifyByCode(code);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EEEEEE] px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-center text-lg font-extrabold text-black mb-6">
          Verifikasi Surat — Desa Sangkima
        </h1>

        {result.valid ? (
          <div>
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
                ✓
              </div>
              <p className="font-bold text-green-600">Surat ASLI &amp; Sah</p>
            </div>
            <dl className="text-sm text-black space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-[#797979]">Nomor Surat</dt>
                <dd className="font-semibold text-right">{result.letterNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#797979]">Jenis Surat</dt>
                <dd className="font-semibold text-right">{result.letterTypeName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#797979]">Atas Nama</dt>
                <dd className="font-semibold text-right">{result.requesterName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#797979]">Tanggal Terbit</dt>
                <dd className="font-semibold text-right">
                  {formatTanggal(result.approvedAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl">
              ✕
            </div>
            <p className="font-bold text-red-600">Surat Tidak Ditemukan</p>
            <p className="text-sm text-[#797979] text-center">
              Kode verifikasi tidak valid atau surat tidak sah.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
