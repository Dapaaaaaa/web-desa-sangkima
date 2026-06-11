import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import type { LetterAttachment } from "../types/letter";

// Aturan lampiran pendukung pengajuan surat
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_ATTACHMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Disimpan DI LUAR public/ supaya tidak bisa diakses tanpa login —
// file dilayani lewat endpoint berotentikasi /api/letter-requests/{id}/lampiran/{i}
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "lampiran");

export type IncomingFile = {
  name: string;
  mime: string;
  size: number;
  buffer: Buffer;
};

/** Validasi jumlah/ukuran/tipe. Throw Error berisi pesan untuk warga. */
export function validateAttachments(files: IncomingFile[]) {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`Maksimal ${MAX_ATTACHMENTS} lampiran`);
  }
  for (const f of files) {
    if (!ALLOWED_ATTACHMENT_TYPES[f.mime]) {
      throw new Error(`Format "${f.name}" tidak didukung (hanya PDF/JPG/PNG)`);
    }
    if (f.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(`Ukuran "${f.name}" melebihi 2 MB`);
    }
  }
}

function sanitizeName(name: string) {
  return path
    .basename(name)
    .replace(/[^\w\s.\-()]/g, "_")
    .slice(0, 100);
}

export async function saveAttachments(
  files: IncomingFile[],
): Promise<LetterAttachment[]> {
  if (files.length === 0) return [];
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const saved: LetterAttachment[] = [];
  for (const f of files) {
    const ext = ALLOWED_ATTACHMENT_TYPES[f.mime];
    const storedName = `${createId()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), f.buffer);
    saved.push({
      name: sanitizeName(f.name),
      storedName,
      mime: f.mime,
      size: f.size,
    });
  }
  return saved;
}

/** Hapus file fisik (dipakai saat rollback bila pembuatan pengajuan gagal). */
export async function deleteAttachments(attachments: LetterAttachment[]) {
  await Promise.all(
    attachments.map((a) =>
      fs.unlink(path.join(UPLOAD_DIR, a.storedName)).catch(() => {}),
    ),
  );
}

export async function readAttachment(storedName: string): Promise<Buffer | null> {
  try {
    // basename mencegah path traversal
    return await fs.readFile(path.join(UPLOAD_DIR, path.basename(storedName)));
  } catch {
    return null;
  }
}
