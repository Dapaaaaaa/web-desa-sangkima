import { NextResponse } from "next/server";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { userRepository } from "@/server/repositories/user.repository";

/**
 * Get current authenticated user
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
export async function GET(req: Request) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get("authorization");
    const authPayload = await verifyAuth(authHeader || undefined);

    if (!authPayload) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - token tidak valid atau expired",
        },
        { status: 401 },
      );
    }

    // Get user from database
    const user = await userRepository.findById(authPayload.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // Return user info (exclude password)
    return NextResponse.json(
      {
        success: true,
        message: "User berhasil diambil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          nik: user.nik,
          role: user.role,
          positionId: user.positionId,
          address: user.address,
          birthday: user.birthday,
          placeOfBirth: user.placeOfBirth,
          job: user.job,
          gender: user.gender,
          telp: user.telp,
          citizenship: user.citizenship,
          status: user.status,
          education: user.education,
          religion: user.religion,
          emailVerifiedAt: user.emailVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 500 },
    );
  }
}
