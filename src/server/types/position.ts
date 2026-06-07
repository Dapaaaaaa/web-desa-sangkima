import { z } from "zod";

/* ---------- */
/* Schemas    */
/* ---------- */

export const createPositionSchema = z.object({
  category: z.string().min(1, "Kategori tidak boleh kosong"),
  name: z.string().min(1, "Nama jabatan tidak boleh kosong"),
});

export const updatePositionSchema = createPositionSchema.partial();

/* ---------- */
/* Types      */
/* ---------- */

export type TCreatePositionInput = z.infer<typeof createPositionSchema>;
export type TUpdatePositionInput = z.infer<typeof updatePositionSchema>;

export type PositionDTO = {
  id: string;
  category: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
};
