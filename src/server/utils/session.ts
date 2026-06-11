import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { userRepository } from "../repositories/user.repository";
import type { UserRole } from "../middlewares/role.middleware";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  nik: string;
  role: UserRole;
};

/**
 * Ambil user yang sedang login dari cookie httpOnly "access_token".
 * Dipakai oleh server component (layout/page dashboard) — tanpa lewat HTTP.
 * Mengembalikan null jika belum login / token kadaluarsa / akun nonaktif.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.id) return null;

  const user = await userRepository.findById(payload.id as string);
  if (!user || user.deletedAt) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nik: user.nik,
    role: user.role as UserRole,
  };
}
