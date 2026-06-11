import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function JenisSuratPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role !== "admin") redirect("/dashboard");

  const types = await letterTypeService.list(false);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black">Jenis Surat</h1>
      <p className="text-sm text-[#797979] mt-1 mb-8">
        Kelola jenis surat yang dapat diajukan warga. Jenis yang dinonaktifkan
        tidak muncul di formulir pengajuan, tetapi surat lama tetap sah.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#797979] border-b border-gray-100">
                <th className="px-6 py-3 font-bold">Kode</th>
                <th className="px-6 py-3 font-bold">Nama</th>
                <th className="px-6 py-3 font-bold">Field Tambahan</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-black">{t.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-black">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-[#797979] mt-0.5 max-w-xs">
                        {t.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#797979]">
                    {t.requiredFields.length === 0
                      ? "—"
                      : t.requiredFields.map((f) => f.label).join(", ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        t.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ToggleActiveButton id={t.id} active={t.active} name={t.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
