import { userRepository } from "../repositories/user.repository";
import { verifyAuth } from "./auth.middleware";

export type UserRole = "user" | "staff" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  nik: string;
  role: UserRole;
};

/**
 * Verifikasi JWT lalu ambil data user (termasuk role) dari database.
 * JWT hanya menyimpan id/email/nik, jadi role harus diambil dari DB.
 * Mengembalikan null jika token tidak valid atau user tidak ada.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get("authorization");
  const payload = await verifyAuth(authHeader || undefined);
  if (!payload) return null;

  const user = await userRepository.findById(payload.id);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    nik: user.nik,
    role: user.role as UserRole,
  };
}
