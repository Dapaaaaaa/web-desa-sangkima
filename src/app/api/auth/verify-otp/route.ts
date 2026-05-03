import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

const verifyOTPSchema = z.object({
  userId: z.string().min(1, "User ID tidak boleh kosong"),
  otp: z
    .string()
    .length(4, "OTP harus tepat 4 digit")
    .regex(/^\d+$/, "OTP hanya boleh berisi angka"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = verifyOTPSchema.parse(body);

    const result = await authService.verifyOTP(
      validatedData.userId,
      validatedData.otp,
    );

    return NextResponse.json(
      { success: true, message: result.message },
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
