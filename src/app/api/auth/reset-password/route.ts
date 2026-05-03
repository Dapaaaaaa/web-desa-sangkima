import { NextResponse } from "next/server";
import { userRepository } from "@/server/repositories/user.repository";
import { hashPassword } from "@/server/utils/hash";
import z from "zod";

const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, "User ID tidak boleh kosong"),
    token: z.string().min(1, "Token tidak boleh kosong"),
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

/**
 * Reset Password - Finalize password reset
 * POST /api/auth/reset-password
 *
 * Flow:
 * 1. User submit userId, token, dan newPassword
 * 2. Verify token masih valid (belum expired, belum dipakai)
 * 3. Hash password baru
 * 4. Update password di database
 * 5. Mark token sebagai sudah dipakai
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Find valid reset token
    const resetToken = await userRepository.findValidPasswordResetToken(
      validatedData.userId,
      validatedData.token,
    );

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid atau sudah expired",
        },
        { status: 400 },
      );
    }

    // Get user
    const user = await userRepository.findById(validatedData.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(validatedData.newPassword);

    // Update user password
    await userRepository.updateUserPassword(validatedData.userId, passwordHash);

    // Mark token as used
    await userRepository.markTokenAsUsed(resetToken.id);

    return NextResponse.json(
      {
        success: true,
        message:
          "Password berhasil direset. Silakan login dengan password baru Anda.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 400 },
    );
  }
}
