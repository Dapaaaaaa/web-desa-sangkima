import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggalWaktu } from "@/lib/format";
import PermohonanActions from "./PermohonanActions";

type PageProps = { params: Promise<{ id: string }> };

export default async function DetailPermohonanPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role === "user") redirect("/dashboard");

  const { id } = await params;
  let surat;
  try {
    surat = await letterRequestService.getForActor(id, session);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/permohonan"
        className="text-sm font-bold text-[#009FFF] hover:underline"
      >
        ← Kembali ke Permohonan
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
            <dt className="text-[#797979]">Pemohon</dt>
            <dd className="font-semibold text-black text-right">
              {surat.requester.name}
            </dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-[#797979]">NIK</dt>
            <dd className="font-semibold text-black text-right">
              {surat.requester.nik}
            </dd>
          </div>
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

        <PermohonanActions
          id={surat.id}
          status={surat.status}
          role={session.role}
        />
      </div>
    </div>
  );
}
