import type { LetterAttachmentDTO } from "@/server/types/letter";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Daftar lampiran pendukung pada halaman detail (warga & petugas). */
export default function LampiranList({
  requestId,
  attachments,
}: {
  requestId: string;
  attachments: LetterAttachmentDTO[];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="label-doc">Lampiran Pendukung</p>
      <ul className="flex flex-col gap-2">
        {attachments.map((a, i) => (
          <li key={`${a.name}-${i}`}>
            <a
              href={`/api/letter-requests/${requestId}/lampiran/${i}`}
              target="_blank"
              className="flex items-center justify-between gap-3 border border-line rounded-[4px] bg-card hover:bg-paper2/40 transition-colors px-3.5 py-2.5 group"
            >
              <span className="min-w-0 flex items-baseline gap-2.5">
                <span className="font-mono text-xs text-brass shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium truncate">{a.name}</span>
                <span className="text-xs text-inkmut shrink-0">
                  {formatSize(a.size)}
                </span>
              </span>
              <span className="text-xs font-semibold text-brass group-hover:underline underline-offset-2 shrink-0">
                Lihat →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
