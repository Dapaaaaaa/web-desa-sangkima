/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: "👤 Detail user"
 *     description: Mengambil detail satu user berdasarkan ID. Hanya untuk admin.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: User tidak ditemukan
 *   put:
 *     tags:
 *       - Users
 *     summary: "✏️ Edit user (admin)"
 *     description: Mengubah data user. Semua field opsional. Jika password diisi akan di-hash ulang.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               nik:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, staff, admin]
 *               positionId:
 *                 type: string
 *                 nullable: true
 *               religion:
 *                 type: string
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
 *       200:
 *         description: User berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: User tidak ditemukan
 *   delete:
 *     tags:
 *       - Users
 *     summary: "🗑️ Hapus user (soft delete, admin)"
 *     description: Menghapus user secara soft delete (set deletedAt). Data tetap ada di database.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: User tidak ditemukan
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const data = await userService.getById(id);

    return NextResponse.json(
      { success: true, message: "Detail user berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "User tidak ditemukan" },
      { status: 404 },
    );
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const body = await req.json();
    const data = await userService.update(id, body);

    return NextResponse.json(
      { success: true, message: "User berhasil diperbarui", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const isNotFound = error.message?.includes("tidak ditemukan");
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: isNotFound ? 404 : 400 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    await userService.softDelete(id);

    return NextResponse.json(
      { success: true, message: "User berhasil dihapus" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "User tidak ditemukan" },
      { status: 404 },
    );
  }
}
