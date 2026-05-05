import crypto from "crypto";

/**
 * Generate secure reset token
 * Token berbentuk string random yang aman
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculate reset token expiration (1 hour from now)
 */
export function getResetTokenExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
}
