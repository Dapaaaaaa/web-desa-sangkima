import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import AjukanForm from "./AjukanForm";

export default async function AjukanPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const types = await letterTypeService.list(true);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-black">Ajukan Surat</h1>
      <p className="text-sm text-[#797979] mt-1 mb-8">
        Pilih jenis surat dan lengkapi data yang diperlukan. Data diri Anda
        diambil otomatis dari profil.
      </p>
      <AjukanForm types={types} />
    </div>
  );
}
