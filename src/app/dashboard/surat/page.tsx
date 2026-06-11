import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggal } from "@/lib/format";

export default async function SuratSayaPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const requests = await letterRequestService.listForUser(session.id);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Surat Saya</h1>
          <p className="text-sm text-[#797979] mt-1">
            Riwayat semua pengajuan surat Anda.
          </p>
        </div>
        <Link
          href="/dashboard/ajukan"
          className="inline-flex items-center justify-center gap-2 bg-[#70C7FF] hover:bg-[#5bc0ff] text-black font-bold text-sm rounded-xl px-5 py-3 transition-colors active:scale-[0.99]"
        >
          + Ajukan Surat Baru
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-bold text-black mb-1">Belum ada surat</p>
            <p className="text-sm text-[#797979]">
              Klik “Ajukan Surat Baru” untuk membuat pengajuan pertama Anda.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/surat/${r.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-black text-sm truncate">
                      {r.letterType.name}
                    </p>
                    <p className="text-xs text-[#797979] mt-0.5 truncate">
                      {r.letterNumber ? `${r.letterNumber} · ` : ""}
                      Diajukan {formatTanggal(r.createdAt)}
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
