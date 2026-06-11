import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { LETTER_STATUSES } from "@/server/types/letter";
import { formatTanggal } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const requests =
    session.role === "user"
      ? await letterRequestService.listForUser(session.id)
      : await letterRequestService.listAll();

  const counts = Object.fromEntries(
    LETTER_STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length]),
  );
  const recent = requests.slice(0, 5);
  const isPetugas = session.role !== "user";

  const statCards = [
    { label: "Diajukan", value: counts.DIAJUKAN, color: "text-gray-700" },
    { label: "Diproses", value: counts.DIPROSES, color: "text-blue-600" },
    { label: "Disetujui", value: counts.DISETUJUI + counts.SELESAI, color: "text-green-600" },
    { label: "Ditolak", value: counts.DITOLAK, color: "text-red-500" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-black">
            Halo, {session.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#797979] mt-1">
            {isPetugas
              ? "Berikut ringkasan permohonan surat warga Desa Sangkima."
              : "Kelola pengajuan surat Anda di Desa Sangkima."}
          </p>
        </div>
        {session.role === "user" && (
          <Link
            href="/dashboard/ajukan"
            className="inline-flex items-center justify-center gap-2 bg-[#70C7FF] hover:bg-[#5bc0ff] text-black font-bold text-sm rounded-xl px-5 py-3 transition-colors active:scale-[0.99]"
          >
            + Ajukan Surat Baru
          </Link>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-sm font-bold text-[#797979] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-black">
            {isPetugas ? "Permohonan Terbaru" : "Pengajuan Terbaru"}
          </h2>
          <Link
            href={isPetugas ? "/dashboard/permohonan" : "/dashboard/surat"}
            className="text-sm font-bold text-[#009FFF] hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-black mb-1">Belum ada pengajuan</p>
            <p className="text-sm text-[#797979]">
              {isPetugas
                ? "Permohonan surat dari warga akan tampil di sini."
                : "Mulai dengan mengajukan surat pertama Anda."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={
                    isPetugas
                      ? `/dashboard/permohonan/${r.id}`
                      : `/dashboard/surat/${r.id}`
                  }
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-black text-sm truncate">
                      {r.letterType.name}
                    </p>
                    <p className="text-xs text-[#797979] mt-0.5 truncate">
                      {isPetugas ? `${r.requester.name} · ` : ""}
                      {formatTanggal(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
