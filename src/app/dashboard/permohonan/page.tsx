import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  LETTER_STATUSES,
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";
import { formatTanggal } from "@/lib/format";

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function PermohonanPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role === "user") redirect("/dashboard");

  const { status: statusParam } = await searchParams;
  const status = LETTER_STATUSES.includes(statusParam as LetterStatus)
    ? (statusParam as LetterStatus)
    : undefined;

  const requests = await letterRequestService.listAll(status);

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: "Semua", href: "/dashboard/permohonan", active: !status },
    ...LETTER_STATUSES.map((s) => ({
      label: LETTER_STATUS_META[s].label,
      href: `/dashboard/permohonan?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black">Permohonan Surat</h1>
      <p className="text-sm text-[#797979] mt-1 mb-6">
        Kelola pengajuan surat dari warga.
      </p>

      {/* Filter status */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              f.active
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-[#666] hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-bold text-black mb-1">Tidak ada permohonan</p>
            <p className="text-sm text-[#797979]">
              {status
                ? `Belum ada surat berstatus ${LETTER_STATUS_META[status].label}.`
                : "Permohonan dari warga akan tampil di sini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#797979] border-b border-gray-100">
                  <th className="px-6 py-3 font-bold">Pemohon</th>
                  <th className="px-6 py-3 font-bold">Jenis Surat</th>
                  <th className="px-6 py-3 font-bold">Tanggal</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-black">{r.requester.name}</p>
                      <p className="text-xs text-[#797979]">{r.requester.nik}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-black">
                      {r.letterType.name}
                    </td>
                    <td className="px-6 py-4 text-[#797979]">
                      {formatTanggal(r.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/permohonan/${r.id}`}
                        className="font-bold text-[#009FFF] hover:underline whitespace-nowrap"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
