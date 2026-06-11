import {
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";

// Gaya "cap/stempel" dokumen: kotak bergaris, huruf kapital berjarak
const STAMP_CLASSES: Record<LetterStatus, string> = {
  DIAJUKAN: "border-line text-inkmut",
  DIPROSES: "border-brass/50 text-brass bg-brass/[0.06]",
  DISETUJUI: "border-pine-600/50 text-pine-700 bg-pine-600/[0.06]",
  DITOLAK: "border-oxide/50 text-oxide bg-oxide/[0.06]",
  SELESAI: "border-pine-800 bg-pine-800 text-paper",
};

export default function StatusBadge({ status }: { status: LetterStatus }) {
  const meta = LETTER_STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center border rounded-[3px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] whitespace-nowrap ${STAMP_CLASSES[status]}`}
    >
      {meta.label}
    </span>
  );
}
