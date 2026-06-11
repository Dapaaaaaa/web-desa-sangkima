import { userRepository } from "../repositories/user.repository";
import { verifyToken } from "../utils/jwt";

export type UserRole = "user" | "staff" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  nik: string;
  role: UserRole;
};

/**
 * Ambil JWT dari request: utamakan header "Authorization: Bearer <token>",
 * fallback ke cookie httpOnly "access_token" (di-set oleh /api/auth/login)
 * supaya sesi login dari browser juga dikenali oleh API.
 */
function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Verifikasi JWT lalu ambil data user (termasuk role) dari database.
 * JWT hanya menyimpan id/email/nik, jadi role harus diambil dari DB.
 * Mengembalikan null jika token tidak valid, user tidak ada,
 * atau akun sudah dinonaktifkan (soft delete).
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.id) return null;

  const user = await userRepository.findById(payload.id as string);
  // akun yang dinonaktifkan tidak boleh memakai token lama yang masih hidup
  if (!user || user.deletedAt) return null;

  return {
    id: user.id,
    email: user.email,
    nik: user.nik,
    role: user.role as UserRole,
  };
}
