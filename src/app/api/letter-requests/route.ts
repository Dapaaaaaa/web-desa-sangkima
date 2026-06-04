/**
 * @swagger
 * /api/letter-requests:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "📨 Daftar pengajuan surat"
 *     description: Warga melihat pengajuan miliknya sendiri; petugas (staff/admin) melihat semua. Filter dengan ?status=.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DIAJUKAN, DIPROSES, DISETUJUI, DITOLAK, SELESAI]
 *     responses:
 *       200:
 *         description: Daftar pengajuan
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "➕ Ajukan surat (warga)"
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [letterTypeId, purpose]
 *             properties:
 *               letterTypeId:
 *                 type: string
 *               purpose:
 *                 type: string
 *                 example: Persyaratan beasiswa
 *               data:
 *                 type: object
 *                 description: Jawaban field tambahan sesuai jenis surat
 *     responses:
 *       201:
 *         description: Pengajuan berhasil dibuat
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Unauthorized
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { getAuthUser } from "@/server/middlewares/role.middleware";
import { LETTER_STATUSES, type LetterStatus } from "@/server/types/letter";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - token tidak valid" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam && LETTER_STATUSES.includes(statusParam as LetterStatus)
        ? (statusParam as LetterStatus)
        : undefined;

    const data =
      auth.role === "user"
        ? await letterRequestService.listForUser(auth.id, status)
        : await letterRequestService.listAll(status);

    return NextResponse.json(
      { success: true, message: "Daftar pengajuan berhasil diambil", data },
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

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - token tidak valid" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const data = await letterRequestService.create(auth, body);

    return NextResponse.json(
      { success: true, message: "Pengajuan surat berhasil dibuat", data },
      { status: 201 },
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
