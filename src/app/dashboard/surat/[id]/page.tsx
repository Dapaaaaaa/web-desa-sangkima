import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggalWaktu } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function DetailSuratPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const { id } = await params;
  let surat;
  try {
    surat = await letterRequestService.getForActor(id, session);
  } catch {
    notFound();
  }

  const bisaUnduh = surat.status === "DISETUJUI" || surat.status === "SELESAI";

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/surat"
        className="text-sm font-bold text-[#009FFF] hover:underline"
      >
        ← Kembali ke Surat Saya
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-black">
              {surat.letterType.name}
            </h1>
            {surat.letterNumber && (
              <p className="text-sm text-[#797979] mt-1">{surat.letterNumber}</p>
            )}
          </div>
          <StatusBadge status={surat.status} />
        </div>

        {surat.status === "DITOLAK" && surat.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm font-bold text-red-600">Alasan penolakan</p>
            <p className="text-sm text-red-500 mt-0.5">{surat.rejectionReason}</p>
          </div>
        )}

        <dl className="text-sm space-y-3">
          <div className="flex justify-between gap-6">
            <dt className="text-[#797979]">Keperluan</dt>
            <dd className="font-semibold text-black text-right">{surat.purpose}</dd>
          </div>
          {surat.data &&
            Object.entries(surat.data).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6">
                <dt className="text-[#797979] capitalize">
                  {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                </dt>
                <dd className="font-semibold text-black text-right">{String(v ?? "-")}</dd>
              </div>
            ))}
          <div className="flex justify-between gap-6">
            <dt className="text-[#797979]">Diajukan</dt>
            <dd className="font-semibold text-black text-right">
              {formatTanggalWaktu(surat.createdAt)}
            </dd>
          </div>
          {surat.approvedAt && (
            <div className="flex justify-between gap-6">
              <dt className="text-[#797979]">Disetujui</dt>
              <dd className="font-semibold text-black text-right">
                {formatTanggalWaktu(surat.approvedAt)}
              </dd>
            </div>
          )}
        </dl>

        {bisaUnduh && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={`/api/letter-requests/${surat.id}/pdf`}
              target="_blank"
              className="flex-1 text-center bg-[#70C7FF] hover:bg-[#5bc0ff] text-black font-bold text-sm rounded-xl py-3.5 transition-colors active:scale-[0.99]"
            >
              📄 Unduh Surat (PDF)
            </a>
            {surat.verificationCode && (
              <a
                href={`/verifikasi/${surat.verificationCode}`}
                target="_blank"
                className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-black font-bold text-sm rounded-xl py-3.5 transition-colors"
              >
                🔎 Cek Keaslian
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
