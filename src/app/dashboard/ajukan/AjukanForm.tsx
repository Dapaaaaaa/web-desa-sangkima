"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { LetterTypeDTO } from "@/server/types/letter";

const inputClass =
  "w-full bg-[#EFEFEF] border-none rounded-lg py-3 px-4 text-sm text-black outline-none placeholder-[#999] transition-all focus:ring-2 focus:ring-[#70C7FF]/40";

export default function AjukanForm({ types }: { types: LetterTypeDTO[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [typeId, setTypeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => types.find((t) => t.id === typeId),
    [types, typeId],
  );

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

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

      const res = await fetch("/api/letter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterTypeId: selected.id,
          purpose,
          data: payload,
        }),
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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col gap-5"
    >
      {/* Jenis surat */}
      <div>
        <label htmlFor="jenis" className="block text-sm font-bold text-black mb-1.5">
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
          className={inputClass}
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
          <p className="text-xs text-[#797979] mt-2">{selected.description}</p>
        )}
      </div>

      {/* Keperluan */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-bold text-black mb-1.5">
          Keperluan
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Contoh: Persyaratan beasiswa KIP Kuliah"
          required
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Field dinamis sesuai jenis surat */}
      {selected && selected.requiredFields.length > 0 && (
        <div className="flex flex-col gap-5 border-t border-gray-100 pt-5">
          <p className="text-sm font-extrabold text-black">
            Data Tambahan — {selected.name}
          </p>
          {selected.requiredFields.map((f) => (
            <div key={f.name}>
              <label
                htmlFor={f.name}
                className="block text-sm font-bold text-black mb-1.5"
              >
                {f.label}
                {!f.required && (
                  <span className="text-[#999] font-medium"> (opsional)</span>
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
                  className={inputClass}
                />
              ) : (
                <input
                  id={f.name}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={data[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !typeId}
        className="w-full bg-[#70C7FF] hover:bg-[#5bc0ff] text-black font-bold text-sm rounded-xl py-3.5 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {submitting ? "Mengirim..." : "Kirim Pengajuan"}
      </button>
    </form>
  );
}
