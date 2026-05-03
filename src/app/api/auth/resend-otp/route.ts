import { NextResponse } from "next/server";
import { userRepository } from "@/server/repositories/user.repository";
import { generateOTP, getOTPExpiration } from "@/server/utils/otp";
import { sendOTPEmail } from "@/server/services/email.service";
import z from "zod";
import { db } from "@/server/db";
import { userTokens } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const resendOTPSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resendOTPSchema.parse(body);

    // Find user
    const user = await userRepository.findByEmail(validatedData.email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email tidak terdaftar",
        },
        { status: 404 },
      );
    }

    // Check if email already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah diaktifkan. Silakan login.",
        },
        { status: 400 },
      );
    }

    // Delete old OTP token
    await db
      .delete(userTokens)
      .where(and(eq(userTokens.userId, user.id), eq(userTokens.type, "OTP")));

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await userRepository.createOTPToken(user.id, otp, expiresAt);

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim email OTP",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Kode OTP baru telah dikirim ke email Anda",
        data: {
          userId: user.id,
          email: user.email,
        },
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
