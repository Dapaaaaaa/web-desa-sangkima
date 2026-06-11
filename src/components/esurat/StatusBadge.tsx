import {
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
};

export default function StatusBadge({ status }: { status: LetterStatus }) {
  const meta = LETTER_STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${COLOR_CLASSES[meta.color]}`}
    >
      {meta.label}
    </span>
  );
}
