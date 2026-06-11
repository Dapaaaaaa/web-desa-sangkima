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
    { label: "Diajukan", value: counts.DIAJUKAN, accent: "bg-inkmut" },
    { label: "Diproses", value: counts.DIPROSES, accent: "bg-brass" },
    { label: "Disetujui", value: counts.DISETUJUI + counts.SELESAI, accent: "bg-pine-600" },
    { label: "Ditolak", value: counts.DITOLAK, accent: "bg-oxide" },
  ];

  return (
    <div>
      {/* Kop halaman */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 rise-in">
        <div>
          <p className="overline-doc">Beranda</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-1.5">
            Selamat datang, {session.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-inkmut mt-2">
            {isPetugas
              ? "Ringkasan permohonan surat warga Desa Sangkima."
              : "Kelola pengajuan surat Anda di Desa Sangkima."}
          </p>
        </div>
        {session.role === "user" && (
          <Link href="/dashboard/ajukan" className="btn-primary">
            Ajukan Surat Baru
          </Link>
        )}
      </div>

      {/* Statistik */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 rise-in"
        style={{ animationDelay: "80ms" }}
      >
        {statCards.map((c) => (
          <div key={c.label} className="card-doc p-5">
            <span className={`block w-6 h-[3px] ${c.accent} mb-4`} />
            <p className="font-serif text-4xl font-medium tabular-nums">
              {c.value}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-inkmut mt-1.5">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Terbaru */}
      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "160ms" }}>
        <div className="flex items-baseline justify-between px-6 py-4 border-b border-line">
          <h2 className="font-serif text-xl font-medium">
            {isPetugas ? "Permohonan Terbaru" : "Pengajuan Terbaru"}
          </h2>
          <Link
            href={isPetugas ? "/dashboard/permohonan" : "/dashboard/surat"}
            className="text-xs font-semibold text-brass hover:underline underline-offset-2"
          >
            Lihat semua →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-serif text-lg">Belum ada pengajuan</p>
            <p className="text-sm text-inkmut mt-1">
              {isPetugas
                ? "Permohonan surat dari warga akan tampil di sini."
                : "Mulai dengan mengajukan surat pertama Anda."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line/70">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={
                    isPetugas
                      ? `/dashboard/permohonan/${r.id}`
                      : `/dashboard/surat/${r.id}`
                  }
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-paper2/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {r.letterType.name}
                    </p>
                    <p className="text-xs text-inkmut mt-1 truncate">
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
