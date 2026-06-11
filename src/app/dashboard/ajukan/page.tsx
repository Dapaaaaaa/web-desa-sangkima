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
      <div className="rise-in">
        <p className="overline-doc">Formulir Permohonan</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-1.5">
          Ajukan Surat
        </h1>
        <p className="text-sm text-inkmut mt-2 mb-8">
          Pilih jenis surat dan lengkapi data yang diperlukan. Data diri Anda
          diambil otomatis dari profil kependudukan.
        </p>
      </div>
      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        <AjukanForm types={types} />
      </div>
    </div>
  );
}
