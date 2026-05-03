import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.verifyOTP(body);

    return NextResponse.json(
      { success: result.success, message: result.message },
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
