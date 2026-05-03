import { NextResponse } from "next/server";
import { userRepository } from "@/server/repositories/user.repository";
import {
  generateResetToken,
  getResetTokenExpiration,
} from "@/server/utils/reset-token";
import { sendPasswordResetEmail } from "@/server/services/email.service";
import z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

/**
 * Forgot Password - Request password reset token
 * POST /api/auth/forgot-password
 *
 * Flow:
 * 1. User submit email
 * 2. Cari user berdasarkan email
 * 3. Generate reset token
 * 4. Simpan token ke database
 * 5. Kirim email dengan reset link
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await userRepository.findByEmail(validatedData.email);

    if (!user) {
      // SECURITY: Jangan beri tahu apakah email exist atau tidak
      // Return success response untuk prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          message:
            "Jika email terdaftar, Anda akan menerima link reset password",
        },
        { status: 200 },
      );
    }

    // Check if email is verified
    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email belum diaktifkan. Silakan verifikasi email terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = getResetTokenExpiration();

    // Save reset token to database
    await userRepository.createPasswordResetToken(
      user.id,
      resetToken,
      expiresAt,
    );

    // Build reset URL
    // TODO: Update dengan domain production
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?userId=${user.id}&token=${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken, resetUrl);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim email reset password",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Jika email terdaftar, Anda akan menerima link reset password",
        // Dev mode info
        ...(process.env.NODE_ENV === "development" && {
          _dev: {
            userId: user.id,
            resetToken,
            resetUrl,
          },
        }),
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
