/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: "📋 Daftar user (admin)"
 *     description: Mengambil daftar user secara pagination. Hanya untuk admin.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Daftar user dengan pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *   post:
 *     tags:
 *       - Users
 *     summary: "➕ Tambah user baru (admin)"
 *     description: Admin menambah user baru dengan role dan jabatan. Menggantikan flow register untuk admin.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, nik, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Budi Santoso"
 *               email:
 *                 type: string
 *                 example: "budi@example.com"
 *               nik:
 *                 type: string
 *                 example: "1234567890123456"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, staff, admin]
 *                 example: "staff"
 *               positionId:
 *                 type: string
 *                 nullable: true
 *               religion:
 *                 type: string
 *                 enum: [islam, kristen, katolik, hindu, buddha, konghucu]
 *                 nullable: true
 *               address:
 *                 type: string
 *                 nullable: true
 *               birthday:
 *                 type: string
 *                 example: "1990-01-15"
 *                 nullable: true
 *               placeOfBirth:
 *                 type: string
 *                 nullable: true
 *               job:
 *                 type: string
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *                 nullable: true
 *               telp:
 *                 type: string
 *                 nullable: true
 *               citizenship:
 *                 type: string
 *                 enum: [wni, wna]
 *                 nullable: true
 *               status:
 *                 type: string
 *                 nullable: true
 *               education:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Validasi gagal atau email/NIK sudah digunakan
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));

    const result = await userService.list(page, limit);

    return NextResponse.json(
      { success: true, message: "Daftar user berhasil diambil", ...result },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const body = await req.json();
    const data = await userService.createByAdmin(body);

    return NextResponse.json(
      { success: true, message: "User berhasil dibuat", data },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: 400 },
    );
  }
}
