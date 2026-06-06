import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { letterTypeRepository } from "../repositories/letterType.repository";
import {
  letterRequestRepository,
  type LetterRequestJoinedRow,
} from "../repositories/letterRequest.repository";
import type { AuthUser } from "../middlewares/role.middleware";
import {
  createLetterRequestSchema,
  rejectLetterRequestSchema,
  processLetterRequestSchema,
  approveLetterRequestSchema,
  type LetterFieldDef,
  type LetterRequestDTO,
  type LetterStatus,
} from "../types/letter";
import { formatLetterNumber } from "../utils/letter-number";

function toDTO(row: LetterRequestJoinedRow): LetterRequestDTO {
  const r = row.request;
  return {
    id: r.id,
    status: r.status as LetterStatus,
    purpose: r.purpose,
    data: r.data ?? null,
    letterNumber: r.letterNumber ?? null,
    rejectionReason: r.rejectionReason ?? null,
    verificationCode: r.verificationCode ?? null,
    requester: { id: r.userId, name: row.requesterName, nik: row.requesterNik },
    letterType: { id: r.letterTypeId, code: row.typeCode, name: row.typeName },
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
  };
}

function requireStaffOrAdmin(actor: AuthUser) {
  if (actor.role !== "staff" && actor.role !== "admin") {
    throw new Error("Hanya petugas desa yang boleh melakukan aksi ini");
  }
}

// Ambil baris mentah + pastikan ada
async function getRowOrThrow(id: string) {
  const row = await letterRequestRepository.findById(id);
  if (!row) throw new Error("Pengajuan surat tidak ditemukan");
  return row;
}

export const letterRequestService = {
  // Warga mengajukan surat
  async create(actor: AuthUser, input: unknown): Promise<LetterRequestDTO> {
    const data = createLetterRequestSchema.parse(input);

    const type = await letterTypeRepository.findById(data.letterTypeId);
    if (!type) throw new Error("Jenis surat tidak ditemukan");
    if (!type.active) throw new Error("Jenis surat sedang tidak aktif");

    // pastikan field wajib (sesuai jenis surat) terisi
    const fields = (type.requiredFields ?? []) as LetterFieldDef[];
    for (const f of fields) {
      if (!f.required) continue;
      const v = data.data?.[f.name];
      if (v === undefined || v === null || v === "") {
        throw new Error(`Field "${f.label}" wajib diisi`);
      }
    }

    const id = await letterRequestRepository.create({
      userId: actor.id,
      letterTypeId: data.letterTypeId,
      purpose: data.purpose,
      data: data.data ?? null,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIAJUKAN",
      note: null,
      changedBy: actor.id,
    });

    return toDTO(await getRowOrThrow(id));
  },

  async listForUser(
    userId: string,
    status?: LetterStatus,
  ): Promise<LetterRequestDTO[]> {
    const rows = await letterRequestRepository.findByUser(userId, status);
    return rows.map(toDTO);
  },

  async listAll(status?: LetterStatus): Promise<LetterRequestDTO[]> {
    const rows = await letterRequestRepository.findAll(status);
    return rows.map(toDTO);
  },

  // Detail; warga hanya boleh melihat miliknya sendiri
  async getForActor(id: string, actor: AuthUser): Promise<LetterRequestDTO> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new Error("Anda tidak berhak melihat pengajuan ini");
    }
    return toDTO(row);
  },

  // Operator menerima & memproses: DIAJUKAN -> DIPROSES
  async process(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const { note } = processLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIAJUKAN") {
      throw new Error("Surat hanya bisa diproses dari status Diajukan");
    }
    await letterRequestRepository.update(id, {
      status: "DIPROSES",
      verifiedBy: actor.id,
      verifiedAt: new Date(),
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIPROSES",
      note: note ?? null,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Kepala desa menyetujui: DIPROSES -> DISETUJUI (nomor surat & kode verifikasi dibuat)
  async approve(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    if (actor.role !== "admin") {
      throw new Error("Hanya kepala desa (admin) yang boleh menyetujui surat");
    }
    const { note } = approveLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIPROSES") {
      throw new Error("Surat harus berstatus Diproses sebelum disetujui");
    }

    const now = new Date();
    const sequence =
      (await letterRequestRepository.countApprovedInYear(now.getFullYear())) + 1;

    await letterRequestRepository.update(id, {
      status: "DISETUJUI",
      approvedBy: actor.id,
      approvedAt: now,
      letterNumber: formatLetterNumber(sequence, now),
      verificationCode: createId(),
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DISETUJUI",
      note: note ?? null,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Tolak: DIAJUKAN/DIPROSES -> DITOLAK (wajib alasan)
  async reject(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const { reason } = rejectLetterRequestSchema.parse(input);
    const row = await getRowOrThrow(id);
    if (
      row.request.status !== "DIAJUKAN" &&
      row.request.status !== "DIPROSES"
    ) {
      throw new Error("Hanya surat Diajukan/Diproses yang bisa ditolak");
    }
    await letterRequestRepository.update(id, {
      status: "DITOLAK",
      rejectionReason: reason,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DITOLAK",
      note: reason,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Tandai selesai (sudah diambil/diunduh warga): DISETUJUI -> SELESAI
  async complete(actor: AuthUser, id: string): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DISETUJUI") {
      throw new Error("Hanya surat Disetujui yang bisa ditandai selesai");
    }
    await letterRequestRepository.update(id, {
      status: "SELESAI",
      completedAt: new Date(),
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "SELESAI",
      note: null,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Dispatcher aksi petugas dari satu endpoint PATCH
  async changeStatus(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    const { action } = z
      .object({
        action: z.enum(["process", "approve", "reject", "complete"]),
      })
      .parse(input);

    switch (action) {
      case "process":
        return this.process(actor, id, input);
      case "approve":
        return this.approve(actor, id, input);
      case "reject":
        return this.reject(actor, id, input);
      case "complete":
        return this.complete(actor, id);
    }
  },
};
