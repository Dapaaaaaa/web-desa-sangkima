"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { LetterTypeDTO } from "@/server/types/letter";

// selaras dengan aturan backend (src/server/utils/upload.ts)
const MAX_FILES = 3;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AjukanForm({ types }: { types: LetterTypeDTO[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typeId, setTypeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => types.find((t) => t.id === typeId),
    [types, typeId],
  );

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        toast(`Maksimal ${MAX_FILES} lampiran`, "Lampiran", "error", 4000);
        break;
      }
      if (!ALLOWED.includes(f.type)) {
        toast(`"${f.name}" bukan PDF/JPG/PNG`, "Format Tidak Didukung", "error", 4000);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast(`"${f.name}" melebihi 2 MB`, "Ukuran Terlalu Besar", "error", 4000);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) =>
    setFiles((fs) => fs.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      // angka dikirim sebagai number agar sesuai kontrak API
      const payload: Record<string, string | number> = {};
      for (const f of selected.requiredFields) {
        const v = data[f.name] ?? "";
        if (v === "") continue;
        payload[f.name] = f.type === "number" ? Number(v) : v;
      }

      const fd = new FormData();
      fd.append("letterTypeId", selected.id);
      fd.append("purpose", purpose);
      fd.append("data", JSON.stringify(payload));
      for (const file of files) fd.append("lampiran", file);

      const res = await fetch("/api/letter-requests", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (!res.ok) {
        const firstError =
          json.errors && Object.values(json.errors).flat()[0];
        throw new Error((firstError as string) || json.message || "Gagal mengajukan surat");
      }

      toast(
        "Pengajuan terkirim. Pantau statusnya di menu Surat Saya.",
        "Berhasil Diajukan",
        "success",
        4000,
      );
      router.push("/dashboard/surat");
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Gagal", "error", 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-doc p-6 md:p-8 flex flex-col gap-6">
      {/* Jenis surat */}
      <div>
        <label htmlFor="jenis" className="label-doc">
          Jenis Surat
        </label>
        <select
          id="jenis"
          value={typeId}
          onChange={(e) => {
            setTypeId(e.target.value);
            setData({});
          }}
          required
          className="input-doc"
        >
          <option value="" disabled>
            — Pilih jenis surat —
          </option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.code})
            </option>
          ))}
        </select>
        {selected?.description && (
          <p className="text-xs text-inkmut mt-2 leading-relaxed">
            {selected.description}
          </p>
        )}
      </div>

      {/* Keperluan */}
      <div>
        <label htmlFor="purpose" className="label-doc">
          Keperluan
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Contoh: Persyaratan beasiswa KIP Kuliah"
          required
          rows={3}
          className="input-doc"
        />
      </div>

      {/* Field dinamis sesuai jenis surat */}
      {selected && selected.requiredFields.length > 0 && (
        <div className="flex flex-col gap-5 border-t border-line pt-6">
          <p className="overline-doc !text-inkmut">
            Data Tambahan — {selected.name}
          </p>
          {selected.requiredFields.map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="label-doc">
                {f.label}
                {!f.required && (
                  <span className="normal-case tracking-normal font-medium text-inkmut/70">
                    {" "}
                    (opsional)
                  </span>
                )}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  value={data[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={3}
                  className="input-doc"
                />
              ) : (
                <input
                  id={f.name}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={data[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="input-doc"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lampiran pendukung */}
      <div className="border-t border-line pt-6">
        <p className="label-doc">
          Lampiran Pendukung{" "}
          <span className="normal-case tracking-normal font-medium text-inkmut/70">
            (opsional)
          </span>
        </p>
        <p className="text-xs text-inkmut mb-3 leading-relaxed">
          Sertakan berkas pendukung seperti scan KTP/KK. Maksimal {MAX_FILES}{" "}
          berkas, 2 MB per berkas, format PDF/JPG/PNG.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-line rounded-[4px] bg-paper2/30 hover:bg-paper2/60 transition-colors px-4 py-5 text-sm font-semibold text-inkmut"
          >
            + Pilih berkas dari perangkat
          </button>
        )}

        {files.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-3 border border-line rounded-[4px] bg-card px-3.5 py-2.5"
              >
                <div className="min-w-0 flex items-baseline gap-2.5">
                  <span className="font-mono text-xs text-brass shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  <span className="text-xs text-inkmut shrink-0">
                    {formatSize(f.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-xs font-semibold text-oxide hover:underline underline-offset-2 shrink-0"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || !typeId}
        className="btn-primary w-full"
      >
        {submitting ? "Mengirim..." : "Kirim Pengajuan"}
      </button>
    </form>
  );
}
