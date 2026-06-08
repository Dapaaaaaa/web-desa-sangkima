import { z } from "zod";
import { religions, maritalStatus, educations } from "../db/schema/users";

/* ---------- */
/* Schemas    */
/* ---------- */

export const createUserByAdminSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit angka")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["user", "staff", "admin"]).default("user"),
  positionId: z.string().optional().nullable(),
  religion: z.enum(religions).optional().nullable(),
  address: z.string().optional().nullable(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional()
    .nullable(),
  placeOfBirth: z.string().optional().nullable(),
  job: z.string().optional().nullable(),
  gender: z.enum(["L", "P"]).optional().nullable(),
  telp: z.string().optional().nullable(),
  citizenship: z.enum(["wni", "wna"]).optional().nullable(),
  status: z.enum(maritalStatus).optional().nullable(),
  education: z.enum(educations).optional().nullable(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter").optional(),
    email: z.string().email("Format email tidak valid").optional(),
    nik: z
      .string()
      .length(16, "NIK harus tepat 16 digit angka")
      .regex(/^\d+$/, "NIK hanya boleh berisi angka")
      .optional(),
    password: z.string().min(8, "Password minimal 8 karakter").optional(),
    role: z.enum(["user", "staff", "admin"]).optional(),
    positionId: z.string().optional().nullable(),
    religion: z.enum(religions).optional().nullable(),
    address: z.string().optional().nullable(),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
      .optional()
      .nullable(),
    placeOfBirth: z.string().optional().nullable(),
    job: z.string().optional().nullable(),
    gender: z.enum(["L", "P"]).optional().nullable(),
    telp: z.string().optional().nullable(),
    citizenship: z.enum(["wni", "wna"]).optional().nullable(),
    status: z.enum(maritalStatus).optional().nullable(),
    education: z.enum(educations).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi",
  });

/* ---------- */
/* Types      */
/* ---------- */

export type TCreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;
export type TUpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  nik: string;
  role: "user" | "staff" | "admin";
  positionId: string | null;
  positionName: string | null;
  religion: string | null;
  address: string | null;
  birthday: Date | null;
  placeOfBirth: string | null;
  job: string | null;
  gender: string | null;
  telp: string | null;
  citizenship: string | null;
  status: string | null;
  education: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
