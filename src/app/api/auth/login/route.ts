// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/server/services/auth.service";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = await authService.login(body);
        const cookieStore = await cookies();

        cookieStore.set({
        name: "access_token",
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Hari
        });

        return NextResponse.json(
            {
            success: true,
            message: "Login berhasil",
            data: {
                user: result.user,
                token: result.token,
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
            { status: 401 },
        );
    }
}
