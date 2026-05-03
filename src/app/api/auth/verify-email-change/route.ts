import { NextResponse } from "next/server";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const authPayload = await verifyAuth(authHeader || undefined);

    if (!authPayload) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - silakan login terlebih dahulu",
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Use userId dari token, bukan dari body (lebih aman)
    const result = await authService.verifyEmailChange({
      userId: authPayload.id,
      otp: body.otp,
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: result.data,
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
