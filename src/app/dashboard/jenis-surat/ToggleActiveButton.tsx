"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function ToggleActiveButton({
  id,
  active,
  name,
}: {
  id: string;
  active: boolean;
  name: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/letter-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengubah status");

      toast(
        `${name} kini ${!active ? "aktif" : "nonaktif"}.`,
        "Tersimpan",
        "success",
        3000,
      );
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Gagal", "error", 5000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-60 ${
        active
          ? "bg-white border border-gray-200 text-[#666] hover:bg-gray-50"
          : "bg-[#70C7FF] hover:bg-[#5bc0ff] text-black"
      }`}
    >
      {busy ? "..." : active ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}
