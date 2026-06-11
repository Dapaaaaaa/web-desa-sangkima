"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { LetterStatus } from "@/server/types/letter";

type Props = {
  id: string;
  status: LetterStatus;
  role: "staff" | "admin" | "user";
};

export default function PermohonanActions({ id, status, role }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const doAction = async (body: Record<string, string>, successMsg: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/letter-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Aksi gagal");

      toast(successMsg, "Berhasil", "success", 4000);
      setShowReject(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Gagal", "error", 5000);
    } finally {
      setBusy(false);
    }
  };

  const btn =
    "flex-1 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  if (status === "DITOLAK" || status === "SELESAI") {
    return status === "SELESAI" ? (
      <a
        href={`/api/letter-requests/${id}/pdf`}
        target="_blank"
        className={`${btn} mt-8 block text-center bg-white border border-gray-200 hover:bg-gray-50 text-black`}
      >
        📄 Lihat Surat (PDF)
      </a>
    ) : null;
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      {/* form alasan tolak */}
      {showReject ? (
        <div className="flex flex-col gap-3">
          <label htmlFor="reason" className="text-sm font-bold text-black">
            Alasan Penolakan
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Data alamat tidak sesuai KTP"
            rows={3}
            className="w-full bg-[#EFEFEF] border-none rounded-lg py-3 px-4 text-sm text-black outline-none placeholder-[#999] focus:ring-2 focus:ring-red-200"
          />
          <div className="flex gap-3">
            <button
              onClick={() => doAction({ action: "reject", reason }, "Permohonan ditolak.")}
              disabled={busy || reason.trim().length < 3}
              className={`${btn} bg-red-500 hover:bg-red-600 text-white`}
            >
              {busy ? "Memproses..." : "Konfirmasi Tolak"}
            </button>
            <button
              onClick={() => setShowReject(false)}
              disabled={busy}
              className={`${btn} bg-white border border-gray-200 hover:bg-gray-50 text-black`}
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {status === "DIAJUKAN" && (
            <button
              onClick={() => doAction({ action: "process" }, "Permohonan mulai diproses.")}
              disabled={busy}
              className={`${btn} bg-[#70C7FF] hover:bg-[#5bc0ff] text-black`}
            >
              {busy ? "Memproses..." : "✓ Proses Permohonan"}
            </button>
          )}

          {status === "DIPROSES" &&
            (role === "admin" ? (
              <button
                onClick={() =>
                  doAction(
                    { action: "approve" },
                    "Surat disetujui — nomor surat & PDF telah diterbitkan.",
                  )
                }
                disabled={busy}
                className={`${btn} bg-green-500 hover:bg-green-600 text-white`}
              >
                {busy ? "Memproses..." : "✓ Setujui & Terbitkan"}
              </button>
            ) : (
              <p className="flex-1 text-center text-sm font-semibold text-[#797979] bg-gray-50 rounded-xl py-3">
                Menunggu persetujuan Kepala Desa
              </p>
            ))}

          {status === "DISETUJUI" && (
            <>
              <button
                onClick={() =>
                  doAction({ action: "complete" }, "Surat ditandai selesai.")
                }
                disabled={busy}
                className={`${btn} bg-[#70C7FF] hover:bg-[#5bc0ff] text-black`}
              >
                {busy ? "Memproses..." : "✓ Tandai Selesai"}
              </button>
              <a
                href={`/api/letter-requests/${id}/pdf`}
                target="_blank"
                className={`${btn} text-center bg-white border border-gray-200 hover:bg-gray-50 text-black`}
              >
                📄 Lihat PDF
              </a>
            </>
          )}

          {(status === "DIAJUKAN" || status === "DIPROSES") && (
            <button
              onClick={() => setShowReject(true)}
              disabled={busy}
              className={`${btn} bg-white border border-red-200 hover:bg-red-50 text-red-500`}
            >
              ✕ Tolak
            </button>
          )}
        </div>
      )}
    </div>
  );
}
