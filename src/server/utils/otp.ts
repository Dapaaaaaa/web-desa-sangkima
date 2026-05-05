/**
 * Generate 4-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Calculate OTP expiration time (15 minutes from now)
 */
export function getOTPExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
}
