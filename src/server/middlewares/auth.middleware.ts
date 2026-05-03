import { verifyToken } from "../utils/jwt";

/**
 * Verify JWT token dari Authorization header
 * Format: "Bearer <token>"
 */
export async function verifyAuth(
  authHeader?: string,
): Promise<{ id: string; email: string; nik: string } | null> {
  if (!authHeader) {
    return null;
  }

  // Extract token dari "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  const token = parts[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.id as string,
    email: payload.email as string,
    nik: payload.nik as string,
  };
}

/**
 * Extract token dari request headers
 */
export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
